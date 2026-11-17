import { ChatInputCommandInteraction, GuildMember, CommandInteractionOptionResolver, AutocompleteInteraction, CacheType, EmbedBuilder, DiscordAPIError, RESTJSONErrorCodes } from "discord.js";
import { warnJoinToVC, warnNothingFound, warnJoinToVCBut, warnNeedSameVC } from "./PlayBackStrategy.messages.js";
import { checkUserVC } from "./PlayBackStrategy.modules.js";
import { BClient } from "../client/BClient.js";
import logger from "../client/logger.js";
import { Player, SearchResult, Track } from "moonlink.js";
import { EmptyEmbed, deleteAfterTimer } from "../../utils/messages.js";
import { formatMS_HHMMSS, titleCleaner } from "../../utils/tools.js";
import { getRequesterInfo } from "../music/player.js";
import { discordRelative, startsInMs, totalDuration } from "../music/timing.js";


export enum queryErrors {
    NO_RESULTS = "no_results",
    JOIN_VC = "join_vc",
}

export interface IAddToQueueParams {
    player: Player;
    res: SearchResult;
    inter: ChatInputCommandInteraction<"cached">;
}

/**
 * Álbumes, playlists y artistas de Spotify: LavaSrc los carga con el token anónimo de spotify-tokener
 * (la API oficial los bloquea a apps nuevas). Si fallan, suele ser una playlist privada o generada para
 * una cuenta (Daily Mix, Descubrimiento semanal) o que el contenedor spotify-tokener no está andando.
 */
const SPOTIFY_COLLECTION = /open\.spotify\.com\/(?:intl-[^/]+\/)?(album|playlist|artist)\//;
const SPOTIFY_COLLECTION_MSG = "No se pudo cargar eso de Spotify. Si es una playlist, fijate que sea pública: las privadas y las armadas para tu cuenta (Daily Mix, Descubrimiento semanal) no se pueden leer.";

/** Los avisos de "agregada a la cola" se borran solos: el chat queda limpio y el reproductor no queda tapado */
const ADDED_MESSAGE_TIME = 60_000;

/** Dónde quedan las canciones agregadas: al final (/play), después de la actual (/playnext) o sonando ya (/forceplay) */
export type AddMode = "queue" | "next" | "now";

const ADDED_HEADERS: Record<AddMode | "idle", { track: string; playlist: string }> = {
    queue: { track: "Agregada a la cola 🎧", playlist: "Playlist agregada a la cola 🎧" },
    next: { track: "Suena después de la actual ⏭️", playlist: "Playlist después de la actual ⏭️" },
    now: { track: "Sonando ahora 🎶", playlist: "Playlist sonando ahora 🎶" },
    idle: { track: "Sonando ahora 🎶", playlist: "Playlist sonando ahora 🎶" },
};

/** Límite de Discord para el `value` de una opción de autocompletado */
const AUTOCOMPLETE_VALUE_MAX = 100;

/**
 * Servidores donde ya se está iniciando la reproducción.
 * `player.play()` espera la conexión de voz antes de marcar `playing`, así que dos
 * comandos casi simultáneos podían arrancar dos canciones y saltear una.
 * Es compartido entre /play, /playnext y /forceplay.
 */
const startingPlayback = new Set<string>();

/** Inicia la reproducción si el player está libre, evitando dos `play()` simultáneos (también lo usa /favoritos) */
export async function startIfIdle(player: Player) {
    if (player.playing || startingPlayback.has(player.guildId)) return;

    startingPlayback.add(player.guildId);
    try {
        const started = await player.play();
        if (!started) logger.warn(`[PlaybackStrategy] No se pudo iniciar la reproducción en ${player.guildId}`);
    } finally {
        startingPlayback.delete(player.guildId);
    }
}

export abstract class PlaybackStrategy {

    /** Si las sugerencias piden estar en un canal de voz. /favoritos agregar lo desactiva: guardar no reproduce */
    protected suggestionsNeedVoice = true;

    /** Dónde quedan las canciones; cambia el encabezado del aviso */
    protected addMode: AddMode = "queue";

    async execute(client: BClient, inter: ChatInputCommandInteraction<"cached">) {
        const GuildID = inter.guildId;
        if (!GuildID) return;

        const VCID = (inter.member as GuildMember).voice.channelId;
        if (!VCID) return warnJoinToVC(inter);

        if (!checkUserVC(inter)) return;

        const src = "ytsearch";
        const query = (inter.options as CommandInteractionOptionResolver).getString("busqueda", true);

        if (query == queryErrors.NO_RESULTS) return warnNothingFound(inter);
        if (query == queryErrors.JOIN_VC) return warnJoinToVCBut(inter);

        // Validaciones que responden efímero van antes del defer
        const existing = client.getPlayer(GuildID);
        if (existing?.connected && existing.voiceChannelId !== VCID) return warnNeedSameVC(inter);

        // La búsqueda (YouTube + cipher) y la conexión pueden superar los 3 s que da Discord
        await inter.deferReply();
        logger.info(`[${inter.commandName}] ${inter.user.username} pidió "${query}" en ${inter.guild.name}`);

        try {
            const results: SearchResult | undefined = await client.music.search({ query, source: src, requester: inter.user });

            if (!results?.tracks?.length) {
                const spotifyType = query.match(SPOTIFY_COLLECTION)?.[1];
                logger.info(`[${inter.commandName}] Sin resultados para "${query}" (loadType: ${results?.loadType ?? "desconocido"}${spotifyType ? `, ${spotifyType} de Spotify sin cargar` : ""})`);
                return this.editReplyAndDelete(inter, EmptyEmbed({ description: spotifyType ? SPOTIFY_COLLECTION_MSG : "No se encontraron resultados" }).setColor("Red"));
            }

            const player = client.getPlayerOrDefault(inter, GuildID);
            if (!player.connected) {
                if (player.voiceChannelId !== VCID) player.setVoiceChannelId(VCID);
                await player.connect({ selfDeaf: true, selfMute: false });
            }

            await this.addToQueue({ inter, player, res: results });
            await this.afterAddToQueue(player);
            await startIfIdle(player);

        } catch (err) {
            logger.error(`[${inter.commandName}] Error procesando "${query}" en ${inter.guild.name}:`, err);
            await this.editReplyAndDelete(inter, EmptyEmbed({ description: "❌ Ocurrió un error al reproducir, intenta de nuevo." }).setColor("Red"));
        }
    }

    /**
     * Sugiere canciones mientras el usuario escribe.
     *
     * El `value` de cada opción es la URL de la canción, así `execute` carga exactamente
     * la elegida sin depender de un estado guardado. No crea players ni se conecta a voz.
     */
    async autocomplete(client: BClient, inter: AutocompleteInteraction<CacheType>) {
        try {
            await this.respondAutocomplete(client, inter);
        } catch (err) {
            // Discord descarta la respuesta si el usuario siguió escribiendo o la búsqueda tardó más de 3 s
            if (err instanceof DiscordAPIError && err.code === RESTJSONErrorCodes.UnknownInteraction) {
                logger.debug(`[${inter.commandName}] Autocompletado expirado para "${inter.options.getFocused()}"`);
                return;
            }
            throw err;
        }
    }

    private async respondAutocomplete(client: BClient, inter: AutocompleteInteraction<CacheType>) {
        const GuildID = inter.guildId;
        if (!GuildID) return;

        if (this.suggestionsNeedVoice) {
            const VCID = (inter.member as GuildMember).voice.channelId;
            if (!VCID) return inter.respond([{ name: "Debes unirte a un canal de voz para buscar canciones", value: queryErrors.JOIN_VC }]);

            const player = client.getPlayer(GuildID);
            if (player?.connected && player.voiceChannelId !== VCID)
                return inter.respond([{ name: "Debes unirte al mismo canal de voz que el bot", value: queryErrors.JOIN_VC }]);
        }

        const focusedQuery = inter.options.getFocused().trim();
        if (!focusedQuery.length) return inter.respond([]);

        const res: SearchResult | undefined = await client.music.search({ query: focusedQuery, requester: inter.user });

        if (!res?.tracks?.length) {
            const name = SPOTIFY_COLLECTION.test(focusedQuery) ? "No se pudo cargar de Spotify (¿es una playlist privada?)" : "No se encontraron resultados";
            return inter.respond([{ name: name.slice(0, 100), value: queryErrors.NO_RESULTS }]);
        }

        if (res.loadType === "playlist") {
            // La URL de la playlist es lo que se escribió; si es demasiado larga, al enviar se usa el texto tal cual
            if (focusedQuery.length > AUTOCOMPLETE_VALUE_MAX) return inter.respond([]);
            return inter.respond([{
                name: `Playlist [${res.tracks.length} Tracks] - ${res.playlistInfo?.name ?? "Playlist desconocida"}`.slice(0, 100),
                value: focusedQuery
            }]);
        }

        const options = res.tracks
            .filter(track => track.uri && track.uri.length <= AUTOCOMPLETE_VALUE_MAX)
            .slice(0, 25)
            .map(track => ({
                name: `${formatMS_HHMMSS(track.duration)} ${track.title}`.slice(0, 100),
                value: track.uri!,
            }));

        return inter.respond(options);
    }

    /** Responde editando el mensaje diferido y lo borra a los 15 s */
    private async editReplyAndDelete(inter: ChatInputCommandInteraction<"cached">, embed: EmbedBuilder) {
        deleteAfterTimer(await inter.editReply({ embeds: [embed] }), 15000);
    }

    /**
     * Agrega los resultados a la cola y responde (editando el mensaje diferido)
     * con lo que se agregó. El aviso se borra solo a los ADDED_MESSAGE_TIME.
     */
    private async addToQueue({ player, res, inter }: IAddToQueueParams) {
        // Si no sonaba nada, lo agregado empieza ya, sea cual sea el comando
        const mode = !player.playing && !player.current ? "idle" : this.addMode;
        const requester = getRequesterInfo(inter.member);
        const embed = EmptyEmbed().setColor("Green");

        if (res.loadType === "playlist") {
            const tracks = res.tracks;
            await this.addTracks(player, tracks);

            const query = inter.options.getString("busqueda") ?? "";
            const first = tracks.slice(0, 3).map((t, i) => `**${i + 1}.** ${titleCleaner(t.title, t.author)} · \`${formatMS_HHMMSS(t.duration)}\``);
            if (tracks.length > 3) first.push(`…y ${tracks.length - 3} más`);

            embed.setAuthor({ name: ADDED_HEADERS[mode].playlist, iconURL: requester.avatar })
                .setTitle(res.playlistInfo?.name ?? "Playlist")
                .setURL(/^https?:\/\//.test(query) ? query : null)
                .setDescription(`**${tracks.length}** canciones · ${formatMS_HHMMSS(totalDuration(tracks))} en total`)
                .setThumbnail(tracks[0].artworkUrl ?? null)
                .addFields({ name: "Empieza con", value: first.join("\n").slice(0, 1024) })
                .setFooter({ text: `Pedido por ${requester.name} · ${player.queue.size} en cola` });

            logger.info(`[${inter.commandName}] Playlist "${res.playlistInfo?.name}" (${tracks.length} canciones) agregada en ${inter.guild.name} (${mode}, cola: ${player.queue.size})`);
        } else {
            const track = res.tracks[0];
            await this.addTracks(player, track);

            embed.setAuthor({ name: ADDED_HEADERS[mode].track, iconURL: requester.avatar })
                .setTitle(titleCleaner(track.title, track.author))
                .setURL(track.uri ?? null)
                .setThumbnail(track.artworkUrl ?? null)
                .addFields(
                    { name: "Artista", value: track.author || "Desconocido", inline: true },
                    { name: "Duración", value: track.isStream ? "En vivo" : formatMS_HHMMSS(track.duration), inline: true },
                )
                .setFooter({ text: `Pedido por ${requester.name}` });

            // Solo si espera turno: posición en la cola y cuándo suena (aprox.: pausas y saltos lo cambian)
            const index = player.queue.tracks.indexOf(track);
            if (mode !== "now" && mode !== "idle" && index >= 0) {
                embed.addFields({ name: "Posición", value: `#${index + 1}`, inline: true });
                const startsIn = startsInMs(player.current, player.queue.tracks, index);
                if (startsIn !== undefined) embed.addFields({ name: "Suena", value: `${discordRelative(startsIn)} aprox.` });
            }

            logger.info(`[${inter.commandName}] "${track.title}" agregada en ${inter.guild.name} (${mode}, posición: ${index + 1}, cola: ${player.queue.size})`);
        }

        deleteAfterTimer(await inter.editReply({ embeds: [embed] }), ADDED_MESSAGE_TIME);
    }

    /**
     * Metodo Sobreescribible
     *
     * Agrega a la playlist las canciones, sobre escriba de ser necesario
     * por defecto agrega al final de la playlist
     *
     * @param tracks
     */
    protected async addTracks(player: Player, tracks: Track | Track[]): Promise<void> {
        player.queue.add(tracks);
    }

    protected async afterAddToQueue(player: Player): Promise<void> {
        // implementar si es necesario
    }
}
