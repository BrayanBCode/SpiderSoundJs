import { BotClient } from "@/bot/BotClient.js";
import { IAddToQueueParams } from "@/types/interface/IAddToQueueParams.js";
import { formatMS_HHMMSS } from "@/utils/formatMS_HHMMSS.js";
import { createEmptyEmbed, titleCleaner, replyEmbed, deleteAfterTimer } from "@/utils/tools.js";
import { ChatInputCommandInteraction, GuildMember, CommandInteractionOptionResolver, AutocompleteInteraction, CacheType } from "discord.js";
import { SearchPlatform, SearchResult, Player, Track } from "lavalink-client";
import { warnJoinToVC, warnNothingFound, warnJoinToVCBut, warnNeedSameVC, errorNoMatchesFounded } from "./PlayBackStrategy.messages.js";
import { checkUserVC, trackOptionFormat } from "./PlayBackStrategy.modules.js";


export abstract class PlaybackStrategy {
    private autocompleteMap: Map<string, any>

    constructor() {
        this.autocompleteMap = new Map()

    }

    async execute(client: BotClient, inter: ChatInputCommandInteraction<"cached">) {

        const GuildID = inter.guildId;
        if (!GuildID) return;

        const voiceChannelID = (inter.member as GuildMember).voice.channelId;
        if (!voiceChannelID) return warnJoinToVC(inter)

        if (!checkUserVC(inter)) return

        const src = (inter.options as CommandInteractionOptionResolver).getString("fuente") as SearchPlatform | undefined;
        const query = (inter.options as CommandInteractionOptionResolver).getString("busqueda") as string;

        if (query === "nothing_found") return warnNothingFound(inter)

        if (query === "join_vc") return warnJoinToVCBut(inter)

        const userID = inter.user.id;
        const fromAutoComplete = this.autocompleteMap.has(`${userID}_res`) && query.startsWith("autocomplete_");
        let res: SearchResult | undefined;

        if (fromAutoComplete) {
            // Almacenamos en res la busqueda obtenida en autoComplete
            res = this.getAutoComplete(userID)
        }

        const player = client.getPlayerOrDefault(inter, GuildID)

        if (!player.connected) await player.connect();

        if (player.voiceChannelId !== voiceChannelID) return warnNeedSameVC(inter)

        // ??= solo guarda en la variable si la variable es null/undefined
        res ??= await player.search({
            query: query.replace("autocomplete_", ""),
            source: src ?? "ytsearch"
        }, inter.user) as SearchResult;

        if (!res.tracks.length) return errorNoMatchesFounded(inter)

        this.addToQueue({ inter, player: player, query, res })

        await this.afterAddToQueue(player)

        if (!player.playing) await player.play(player.connected ? { volume: client.defaultVolume, paused: false } : undefined);

    }

    async autocomplete(client: BotClient, inter: AutocompleteInteraction<CacheType>) {

        const GuildID = inter.guildId;
        if (!GuildID) return;

        const voiceChannelID = (inter.member as GuildMember).voice.channelId;
        if (!voiceChannelID) return inter.respond([{ name: `Unete a un canal de voz`, value: "join_vc" }]);

        const focussedQuery = inter.options.getFocused();

        const player = client.getPlayerOrDefault(inter, GuildID)

        if (!player.connected) await player.connect();

        if (player.voiceChannelId !== voiceChannelID) return inter.respond([{ name: `Necesitas estar en un canal de voz`, value: "join_vc" }]);

        if (!focussedQuery.trim().length) return await inter.respond([{ name: `No se encontraron resultados (escribe una busqueda)`, value: "nothing_found" }]);

        const src = (inter.options as CommandInteractionOptionResolver).getString("fuente") as SearchPlatform | undefined ?? "ytsearch" as SearchPlatform;

        const res = await player.search({ query: focussedQuery, source: src }, inter.user) as SearchResult;

        if (!res.tracks.length) return await inter.respond([{ name: `No se encontraron resultados`, value: "nothing_found" }]);

        const userID = inter.user.id;

        // Guardamos la busqueda en autoComplete para usarlos mas tarde
        this.startTOAutoComplete(userID, res)

        await inter.respond(trackOptionFormat(res));
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

    /**
     * Agrega los resultados a la playlist
     * 
     * envia el mensaje al canal de voz correspondiente
     * 
     * @param IAddToQueueParams 
     */
    private async addToQueue({ player, res, query, inter }: IAddToQueueParams) {

        let Msg;

        if (res.loadType === "playlist") {
            await this.addTracks(player, res.tracks)

            const embed = createEmptyEmbed()
                .setAuthor({ name: `Agregando ${res.pluginInfo.type ?? "Playlist"} 🎧` })
                .setTitle(`${res.playlist ? titleCleaner(res.playlist.title, res.playlist.author) : query}`)
                .setThumbnail(res.tracks[0].info.artworkUrl)
                .setColor('Green')

            for (let i = 0; i < Math.min(res.tracks.length, 3); i++) {
                embed.addFields({ name: `${res.tracks[i].info.title}`, value: `${res.tracks[i].info.author} - Duración: ${formatMS_HHMMSS(res.tracks[i].info.duration)}`, inline: true });
            }

            embed.addFields({ name: `Se agregaron:`, value: `${res.tracks.length} canciones más`, inline: false });

            Msg = await (await replyEmbed({ interaction: inter, embed })).fetch();

        } else {
            const track = res.tracks[0]

            await this.addTracks(player, track)

            Msg = await (await replyEmbed({
                interaction: inter,
                embed: createEmptyEmbed()
                    .setAuthor({ name: `Agregando ${titleCleaner(track.info.title, track.info.author)} 🎧` })
                    .setDescription(`Autor: ${track.info.author}`)
                    .setThumbnail(track.info.artworkUrl ?? "")
                    .setColor('Green')
                    .addFields(
                        { name: "Duración", value: formatMS_HHMMSS(track.info.duration), inline: true },
                        { name: "Artista", value: track.info.author, inline: true }
                    ),

            })).fetch()

        }

        deleteAfterTimer(Msg, 15000)

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