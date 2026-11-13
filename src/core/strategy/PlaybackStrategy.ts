import { ChatInputCommandInteraction, GuildMember, CommandInteractionOptionResolver, AutocompleteInteraction, CacheType, EmbedBuilder, DiscordAPIError, RESTJSONErrorCodes } from "discord.js";
import { warnJoinToVC, warnNothingFound, warnJoinToVCBut, warnNeedSameVC } from "./PlayBackStrategy.messages.js";
import { checkUserVC } from "./PlayBackStrategy.modules.js";
import { BClient } from "../client/BClient.js";
import logger from "../client/logger.js";
import { Player, SearchResult, Track } from "moonlink.js";
import { EmptyEmbed, deleteAfterTimer } from "../../utils/messages.js";
import { formatMS_HHMMSS, titleCleaner } from "../../utils/tools.js";


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
 * Links de Spotify que no se pueden cargar: Spotify bloquea a las apps nuevas los endpoints
 * por lotes que LavaSrc usa para álbumes, playlists y artistas. Las canciones sueltas sí funcionan.
 */
const SPOTIFY_UNSUPPORTED = /open\.spotify\.com\/(?:intl-[^/]+\/)?(album|playlist|artist)\//;
const SPOTIFY_UNSUPPORTED_MSG = "De Spotify por ahora solo se aceptan canciones sueltas (no álbumes, playlists ni artistas).";

/** Límite de Discord para el `value` de una opción de autocompletado */
const AUTOCOMPLETE_VALUE_MAX = 100;

/**
 * Servidores donde ya se está iniciando la reproducción.
 * `player.play()` espera la conexión de voz antes de marcar `playing`, así que dos
 * comandos casi simultáneos podían arrancar dos canciones y saltear una.
 * Es compartido entre /play, /playnext y /forceplay.
 */
const startingPlayback = new Set<string>();

export abstract class PlaybackStrategy {

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
                const spotifyType = query.match(SPOTIFY_UNSUPPORTED)?.[1];
                logger.info(`[${inter.commandName}] Sin resultados para "${query}" (loadType: ${results?.loadType ?? "desconocido"}${spotifyType ? `, ${spotifyType} de Spotify no soportado` : ""})`);
                return this.editReplyAndDelete(inter, EmptyEmbed({ description: spotifyType ? SPOTIFY_UNSUPPORTED_MSG : "No se encontraron resultados" }).setColor("Red"));
            }

            const player = client.getPlayerOrDefault(inter, GuildID);
            if (!player.connected) {
                if (player.voiceChannelId !== VCID) player.setVoiceChannelId(VCID);
                await player.connect({ selfDeaf: true, selfMute: false });
            }

            await this.addToQueue({ inter, player, res: results });
            await this.afterAddToQueue(player);
            await this.startIfIdle(player);

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

        const VCID = (inter.member as GuildMember).voice.channelId;
        if (!VCID) return inter.respond([{ name: "Debes unirte a un canal de voz para buscar canciones", value: queryErrors.JOIN_VC }]);

        const player = client.getPlayer(GuildID);
        if (player?.connected && player.voiceChannelId !== VCID)
            return inter.respond([{ name: "Debes unirte al mismo canal de voz que el bot", value: queryErrors.JOIN_VC }]);

        const focusedQuery = inter.options.getFocused().trim();
        if (!focusedQuery.length) return inter.respond([]);

        const res: SearchResult | undefined = await client.music.search({ query: focusedQuery, requester: inter.user });

        if (!res?.tracks?.length) {
            const name = SPOTIFY_UNSUPPORTED.test(focusedQuery) ? SPOTIFY_UNSUPPORTED_MSG : "No se encontraron resultados";
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

    /** Inicia la reproducción si el player está libre, evitando dos `play()` simultáneos */
    private async startIfIdle(player: Player) {
        if (player.playing || startingPlayback.has(player.guildId)) return;

        startingPlayback.add(player.guildId);
        try {
            const started = await player.play();
            if (!started) logger.warn(`[PlaybackStrategy] No se pudo iniciar la reproducción en ${player.guildId}`);
        } finally {
            startingPlayback.delete(player.guildId);
        }
    }

    /** Responde editando el mensaje diferido y lo borra a los 15 s */
    private async editReplyAndDelete(inter: ChatInputCommandInteraction<"cached">, embed: EmbedBuilder) {
        deleteAfterTimer(await inter.editReply({ embeds: [embed] }), 15000);
    }

    /**
     * Agrega los resultados a la cola y responde (editando el mensaje diferido)
     * con lo que se agregó.
     */
    private async addToQueue({ player, res, inter }: IAddToQueueParams) {

        if (res.loadType === "playlist") {
            await this.addTracks(player, res.tracks)

            const embed = EmptyEmbed()
                .setAuthor({ name: `Agregando ${res.loadType} 🎧` })
                .setTitle(res.playlistInfo?.name ?? "Playlist")
                .setThumbnail(res.tracks[0].artworkUrl ?? "")
                .setColor('Green')

            for (let i = 0; i < Math.min(res.tracks.length, 3); i++) {
                embed.addFields({
                    name: `${res.tracks[i].title} `, value: `${res.tracks[i].author} - Duración: ${formatMS_HHMMSS(res.tracks[i].duration)
                        } `, inline: true
                });
            }

            embed.addFields({ name: `Se agregaron: `, value: `${res.tracks.length} canciones más`, inline: false });

            logger.info(`[${inter.commandName}] Playlist "${res.playlistInfo?.name}" (${res.tracks.length} canciones) agregada en ${inter.guild.name}`);
            await inter.editReply({ embeds: [embed] });

        } else {
            const track = res.tracks[0];

            await this.addTracks(player, track)

            logger.info(`[${inter.commandName}] "${track.title}" agregada en ${inter.guild.name} (cola: ${player.queue.size})`);
            await inter.editReply({
                embeds: [EmptyEmbed()
                    .setAuthor({ name: `Agregando ${titleCleaner(track.title, track.author)} 🎧` })
                    .setDescription(`Autor: ${track.author} `)
                    .setThumbnail(track.artworkUrl ?? "")
                    .setColor('Green')
                    .addFields(
                        { name: "Duración", value: formatMS_HHMMSS(track.duration), inline: true },
                        { name: "Artista", value: track.author, inline: true }
                    )]
            });
        }
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
