import { BotClient } from "@/bot/BotClient.js";
import { formatMS_HHMMSS } from "@/utils/formatMS_HHMMSS.js";
import { createEmptyEmbed, titleCleaner, replyEmbed, deleteAfterTimer } from "@/utils/tools.js";
import { ChatInputCommandInteraction, GuildMember, CommandInteractionOptionResolver, AutocompleteInteraction, CacheType } from "discord.js";
import { warnJoinToVC, warnNothingFound, warnJoinToVCBut, warnNeedSameVC, errorNoMatchesFounded } from "./PlayBackStrategy.messages.js";
import { checkUserVC } from "./PlayBackStrategy.modules.js";
import logger from "@/bot/logger.js";
import { queryErrors } from "@/types/enums/EQueryErrors.js";
import { IAddToQueueParams } from "@/types/interface/IQueuePaginator.js";
import { Player, SearchResult, SearchSources, Track } from "moonlink.js";


export abstract class PlaybackStrategy {
    private autocompleteMap: Map<string, any>

    constructor() {
        this.autocompleteMap = new Map()

    }

    async autocomplete(client: BotClient, inter: AutocompleteInteraction<CacheType>) {
        const guildId = inter.guildId;

        if (!guildId) return;

        const VCID = (inter.member as GuildMember).voice.channelId;
        if (!VCID) return inter.respond([{ name: "Debes unirte a un canal de voz", value: "join_vc" }]);

        const focussedQuery = inter.options.getFocused();

        const player = client.getPlayerOrDefault(inter, guildId);
        if (!player.connected) player.connect({ setDeaf: true, setMute: false });
        if (player.voiceChannelId !== VCID) return inter.respond([{ name: "Debes unirte al mismo canal de voz que el bot", value: "join_vc" }]);
        if (!focussedQuery.trim().length) return await inter.respond([{ name: "No se encontró ninguna canción", value: queryErrors.NO_RESULTS }]);

        const res = await client.manager.search({
            query: focussedQuery,
            source: "ytsearch",
            requester: inter.user,
        })

        if (!res.tracks.length) return inter.respond([{ name: "No se encontraron resultados", value: queryErrors.NO_RESULTS }]);

        if (res.loadType === 'playlist') {
            this.startTOAutoComplete(inter.user.id, res);
            return inter.respond([{ name: `Playlist [${res.tracks.length} Tracks] - ${res.playlistInfo.name ?? "Unknown Playlist"}`, value: "autocomplete_0" }]);
        }

        const trackOptions = res.tracks.slice(0, 25).map((track, index) => {
            return {
                name: `${formatMS_HHMMSS(track.duration)} ${track.title}`.slice(0, 100),
                value: `autocomplete_${index}`,
            };
        });

        this.startTOAutoComplete(inter.user.id, res);
        await inter.respond(trackOptions);

    }

    async execute(client: BotClient, inter: ChatInputCommandInteraction<"cached">) {

        const GuildID = inter.guildId;
        if (!GuildID) return;

        const VCID = (inter.member as GuildMember).voice.channelId;
        if (!VCID) return warnJoinToVC(inter);

        if (!checkUserVC(inter)) return;

        const src = (inter.options as CommandInteractionOptionResolver).getString("fuente") as SearchSources | undefined ?? "ytsearch";
        const query = (inter.options as CommandInteractionOptionResolver).getString("busqueda") as string;

        logger.debug(`PlaybackStrategy: ${inter.user.username} - ${query} - ${src}`);

        if (query == queryErrors.NO_RESULTS) return warnNothingFound(inter);
        if (query == queryErrors.JOIN_VC) return warnJoinToVCBut(inter);

        const fromAutocomplete = this.autocompleteMap.get(`${inter.user.id}_res`) && query.startsWith("autocomplete_");

        let results: SearchResult | undefined;

        const player = client.getPlayerOrDefault(inter, GuildID);

        if (fromAutocomplete) results = this.getAutoComplete(inter.user.id)
        else results = await client.manager.search({ query: query, source: src, requester: inter.user }) as SearchResult

        if (!player.connected) player.connect();
        if (player.voiceChannelId !== VCID) return warnNeedSameVC(inter);

        results ??= await client.manager.search({ query, source: src, requester: inter.user }) as SearchResult;

        if (!results.tracks.length) return errorNoMatchesFounded(inter);

        this.addToQueue({ inter, player, res: results, query })

        this.afterAddToQueue(player)

        if (!player.playing && !player.paused) {
            player.play();
            return;
        }

        if (player.paused) {
            player.resume();
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
                .setAuthor({ name: `Agregando ${res.lavasearchPluginInfo?.toString() ?? "Playlist"} 🎧` })
                .setTitle(`${res.playlistInfo ? titleCleaner(res.playlistInfo.name, "") : query}`)
                .setThumbnail(res.tracks[0].artworkUrl ?? "")
                .setColor('Green')

            for (let i = 0; i < Math.min(res.tracks.length, 3); i++) {
                embed.addFields({
                    name: `${res.tracks[i].title}`, value: `${res.tracks[i].author} - Duración: ${formatMS_HHMMSS(res.tracks[i].duration)
                        }`, inline: true
                });
            }

            embed.addFields({ name: `Se agregaron: `, value: `${res.tracks.length} canciones más`, inline: false });

            Msg = await (await replyEmbed({ interaction: inter, embed })).fetch();

        } else {
            const track = query.startsWith("autocomplete_") ? res.tracks[Number(query.replace("autocomplete_", ""))] : res.tracks[0];

            await this.addTracks(player, track)

            Msg = await (await replyEmbed({
                interaction: inter,
                embed: createEmptyEmbed()
                    .setAuthor({ name: `Agregando ${titleCleaner(track.title, track.author)} 🎧` })
                    .setDescription(`Autor: ${track.author} `)
                    .setThumbnail(track.artworkUrl ?? "")
                    .setColor('Green')
                    .addFields(
                        { name: "Duración", value: formatMS_HHMMSS(track.duration), inline: true },
                        { name: "Artista", value: track.author, inline: true }
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