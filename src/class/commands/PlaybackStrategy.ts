import { AutocompleteInteraction, CacheType, ChatInputCommandInteraction, CommandInteractionOptionResolver, GuildMember, VoiceChannel } from 'discord.js';

import { formatMS_HHMMSS } from '../../utils/formatMS_HHMMSS.js';
import { config } from '../../config/config.js';
import { Player, SearchPlatform, SearchResult, Track } from 'lavalink-client';
import logger from '../logger.js';
import { createEmptyEmbed, deleteAfterTimer, simpleEmbedReply, titleCleaner } from '../../utils/tools.js';
import { BotClient } from '../BotClient.js';
import { checkVC } from './PlayBackStrategt.modules.js';


export abstract class PlaybackStrategy {
    private autocompleteMap: Map<string, any>

    constructor() {
        this.autocompleteMap = new Map()

    }


    async execute(client: BotClient, inter: ChatInputCommandInteraction<"cached">) {
        try {
            const GuildID = inter.guildId;
            if (!GuildID) return;

            const voiceChannelID = (inter.member as GuildMember).voice.channelId;
            if (!voiceChannelID) return simpleEmbedReply({
                interaction: inter,
                embed: createEmptyEmbed({ description: "Unete a un canal de voz" }).setColor("Yellow"),
                ephemeral: true
            });

            if (!checkVC(inter)) return

            const src = (inter.options as CommandInteractionOptionResolver).getString("fuente") as SearchPlatform | undefined;
            const query = (inter.options as CommandInteractionOptionResolver).getString("busqueda") as string;

            if (query === "nothing_found") return simpleEmbedReply({
                interaction: inter,
                embed: createEmptyEmbed({ description: "No se encontraron resultados" }).setColor("Yellow"),
                ephemeral: true
            })

            if (query === "join_vc") return simpleEmbedReply({
                interaction: inter,
                embed: createEmptyEmbed({ description: "Te uniste al canal de voz, pero vuelve a ejecutar el comando, por favor.." }).setColor('Yellow'),
                ephemeral: true
            })

            const userID = inter.user.id;
            const fromAutoComplete = this.autocompleteMap.has(`${userID}_res`) && query.startsWith("autocomplete_");
            let res: SearchResult | undefined;

            if (fromAutoComplete) {
                // Almacenamos en res la busqueda obtenida en autoComplete
                res = this.getAutoComplete(userID)
            }

            const player = client.getPlayer(GuildID) ? client.getPlayer(GuildID)! : client.lavaManager.createPlayer({
                guildId: GuildID,
                voiceChannelId: voiceChannelID,
                textChannelId: inter.channelId,
                selfDeaf: true,
                selfMute: false,
                volume: client.defaultVolume,
                node: config.bot.user,
                vcRegion: (inter.member).voice.channel?.rtcRegion!
            })

            if (!player.connected) await player.connect();

            if (player.voiceChannelId !== voiceChannelID) return simpleEmbedReply({
                interaction: inter,
                embed: createEmptyEmbed({ description: "Necesitas estar en el mismo canal que yo" }).setColor("Yellow"),
                ephemeral: true
            })

            // ??= solo guarda en la variable si la variable es null/undefined
            res ??= await player.search({
                query: query.replace("autocomplete_", ""),
                source: src ?? "ytsearch"
            }, inter.user) as SearchResult;


            if (!res.tracks.length) return simpleEmbedReply({
                interaction: inter,
                embed: createEmptyEmbed({ description: "No se encontraron resultados" }).setColor("Red"),
                ephemeral: true
            })

            this.addToQueue({ inter, player: player, query, res })

            await this.afterAddToQueue(player)

            if (!player.playing) await player.play(player.connected ? { volume: client.defaultVolume, paused: false } : undefined);

        } catch (err) {
            if (err instanceof Error) {
                logger.error("play command", err)
                logger.error(`Stack Trace: ${err.stack}`);
            } else {
                logger.error('Ocurrió un error desconocido al registrar los comandos');
            }
        }
    }

    async autocomplete(client: BotClient, inter: AutocompleteInteraction<CacheType>) {
        try {

            const GuildID = inter.guildId;
            if (!GuildID) return;

            const voiceChannelID = (inter.member as GuildMember).voice.channelId;
            if (!voiceChannelID) return inter.respond([{ name: `Unete a un canal de voz`, value: "join_vc" }]);

            const focussedQuery = inter.options.getFocused();

            const player = client.getPlayer(GuildID) ? client.getPlayer(GuildID)! : client.lavaManager.createPlayer({
                guildId: GuildID,
                voiceChannelId: voiceChannelID,
                textChannelId: inter.channelId,
                selfDeaf: true,
                selfMute: false,
                volume: client.defaultVolume,
                node: config.bot.user,
            })

            if (!player.connected) await player.connect();

            if (player.voiceChannelId !== voiceChannelID) return inter.respond([{ name: `Necesitas estar en un canal de voz`, value: "join_vc" }]);

            if (!focussedQuery.trim().length) return await inter.respond([{ name: `No se encontraron resultados (escribe una busqueda)`, value: "nothing_found" }]);

            const src = (inter.options as CommandInteractionOptionResolver).getString("fuente") as SearchPlatform | undefined ?? "ytsearch" as SearchPlatform;

            // !! NO VA ESTO
            // if (focussedQuery.includes("https://")) focussedQuery.replace("https://", "") 

            const res = await player.search({ query: focussedQuery, source: src }, inter.user) as SearchResult;

            if (!res.tracks.length) return await inter.respond([{ name: `No se encontraron resultados`, value: "nothing_found" }]);

            const userID = inter.user.id;

            // Guardamos la busqueda en autoComplete para usarlos mas tarde
            this.startTOAutoComplete(userID, res)

            // pasar esta logica a PlayBackStrategt.modules
            await inter.respond(this.trackOptionFormat(res));
        } catch (err) {
            if (err instanceof Error) {
                logger.error("play command", err)
                logger.error(`Stack Trace: ${err.stack}`);
            } else {
                logger.error('Ocurrió un error desconocido al registrar los comandos');
            }
        }
    }

    /**
     * Obtiene y elimina el registro del auto complete + timer de auto eliminación 
     * @param userID
     * @returns SearchResult
     */
    private getAutoComplete(userID: string) {
        if (this.autocompleteMap.has(`${userID}_timeout`)) clearTimeout(this.autocompleteMap.get(`${userID}_timeout`));

        const search: SearchResult = this.autocompleteMap.get(`${userID}_res`);
        this.autocompleteMap.delete(`${userID}_res`);
        clearTimeout(this.autocompleteMap.get(`${userID}_timeout`));

        this.autocompleteMap.delete(`${userID}_timeout`);

        return search
    }

    private trackOptionFormat(res: SearchResult) {
        const formatTrack = (track: Track, index: number) => ({
            name: `[${formatMS_HHMMSS(track.info.duration)}] ${track.info.title}`.slice(0, 100),
            value: `autocomplete_${index}`,
        });

        const formatPlaylistOption = (title: string, count: number) => ({
            name: `Playlist [${count} Tracks] - ${title}`.slice(0, 100),
            value: `autocomplete_0`,
        });

        if (res.loadType === 'playlist') {
            const title = res.playlist?.title ?? 'Unknown Playlist';
            const count = res.tracks.length;
            return [formatPlaylistOption(title, count)];
        }

        return res.tracks.slice(0, 25).map(formatTrack);
    }


    /**
     * #### start-TimeOut-AutoComplete
     * 
     * almacena en autocompleteMap la busqueda selccionada por el usuario y inicia un timer 
     * 
     * @param userID 
     * @param res 
     */
    private startTOAutoComplete(userID: string, res: SearchResult) {
        if (this.autocompleteMap.has(`${userID}_timeout`)) clearTimeout(this.autocompleteMap.get(`${userID}_timeout`));

        this.autocompleteMap.set(`${userID}_res`, res);
        this.autocompleteMap.set(`${userID}_timeout`, setTimeout(() => {

            this.autocompleteMap.delete(`${userID}_res`);
            clearTimeout(this.autocompleteMap.get(`${userID}_timeout`));

            this.autocompleteMap.delete(`${userID}_timeout`);

        }, 25000));
    }

    private async addToQueue({ player, res, query, inter }: { player: Player, res: SearchResult, query: string, inter: ChatInputCommandInteraction<"cached"> }) {

        let Msg;

        if (res.loadType === "playlist") {
            await this.addTracks(player, res.tracks)

            const embed = createEmptyEmbed()
                .setAuthor({ name: `Agregando ${res.pluginInfo.type ?? "Playlist"} 🎧` })
                .setTitle(`${res.playlist ? res.playlist.title : query}`)
                .setThumbnail(res.tracks[0].info.artworkUrl)
                .setColor('Green')

            for (let i = 0; i < Math.min(res.tracks.length, 3); i++) {
                embed.addFields({ name: `${res.tracks[i].info.title}`, value: `${res.tracks[i].info.author} - Duración: ${formatMS_HHMMSS(res.tracks[i].info.duration)}`, inline: true });
            }

            embed.addFields({ name: `Se agregaron:`, value: `${res.tracks.length} canciones más`, inline: false });

            Msg = await simpleEmbedReply({ interaction: inter, embed });

        } else {
            const track = res.tracks[0]

            await this.addTracks(player, track)

            Msg = await simpleEmbedReply({
                interaction: inter,
                embed: createEmptyEmbed()
                    .setAuthor({ name: `Agregando ${titleCleaner(track.info.title, track.info.author)} 🎧` })
                    .setDescription(`Autor: ${track.info.author}`)
                    .setThumbnail(track.info.artworkUrl ?? "")
                    .setColor('Green')
                    .addFields(
                        { name: "Duración", value: formatMS_HHMMSS(track.info.duration), inline: true },
                        { name: "Fuente", value: track.info.sourceName, inline: true }
                    ),

            });

        }

        const fetched = await Msg.fetch()

        deleteAfterTimer(fetched, 5000)

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
        await player.queue.add(tracks);
    }


    protected async afterAddToQueue(player: Player): Promise<void> {
        // implementar si es necesario
    }
}