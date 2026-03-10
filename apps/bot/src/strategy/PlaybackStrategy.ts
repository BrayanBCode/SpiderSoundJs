import { ChatInputCommandInteraction, GuildMember, CommandInteractionOptionResolver, AutocompleteInteraction, type CacheType } from "discord.js";
import { warnJoinToVC, warnNothingFound, warnJoinToVCBut, warnNeedSameVC, errorNoMatchesFounded } from "./PlayBackStrategy.messages.js";
import { checkUserVC } from "./PlayBackStrategy.modules.js";
import { Player, SearchResult, Track } from "moonlink.js";
import type MusicClient from "../../client/MusicClient.js";
import logger from "../../utils/logger.js";
import { createEmptyEmbed, replyEmbed, titleCleaner } from "../../utils/tools.js";

export declare enum SearchSources {
    YouTube = "youtube",
    YouTubeMusic = "ytmsearch",
    SoundCloud = "scsearch",
    Local = "local"
}

export enum queryErrors {
    NO_RESULTS = "no_results",
    JOIN_VC = "join_vc",
}

export interface IAddToQueueParams {
    player: Player;
    res: SearchResult;
    query: string;
    inter: ChatInputCommandInteraction<"cached">;
}

export function formatMS_HHMMSS(num: number) {
    return [86400000, 3600000, 60000, 1000, 1].reduce((p: number[], c: number) => {
        let res = ~~(num / c);
        num -= res * c;
        return [...p, res];
    }, [])
        .map((v, i) => i <= 1 && v === 0 ? undefined : [i === 4 ? "." : "", v < 10 ? `0${v}` : v, [" Days, ", ":", ":", "", ""][i]].join(""))
        .filter(Boolean)
        .slice(0, -1)
        .join("");
}


export abstract class PlaybackStrategy {
    private autocompleteMap: Map<string, any>;

    constructor() {
        this.autocompleteMap = new Map();

    }

    async execute(client: MusicClient, inter: ChatInputCommandInteraction<"cached">) {
        const GuildID = inter.guildId;
        if (!GuildID) return;

        const VCID = (inter.member as GuildMember).voice.channelId;
        if (!VCID) return warnJoinToVC(inter);

        if (!checkUserVC(inter)) return;

        const query = (inter.options as CommandInteractionOptionResolver).getString("busqueda") as string;

        logger.debug(`PlaybackStrategy: ${inter.user.username} - ${query}`);

        if (query == queryErrors.NO_RESULTS) return warnNothingFound(inter);
        if (query == queryErrors.JOIN_VC) return warnJoinToVCBut(inter);

        const fromAutocomplete = this.autocompleteMap.get(`${inter.user.id}_res`) && query.startsWith("autocomplete_");

        let results: SearchResult | undefined;

        const player = client.getPlayerOrDefault(inter, GuildID);

        if (fromAutocomplete) results = this.getAutoComplete(inter.user.id)
        else results = await client.music.search({ query, requester: inter.user });

        if (!player.connected) player.connect();
        if (player.voiceChannelId != VCID) return warnNeedSameVC(inter);


        if (!results?.tracks.length) return errorNoMatchesFounded(inter);

        this.addToQueue({ inter, player, res: results, query })

        this.afterAddToQueue(player)

        logger.debug(`PlaybackStrategy: ${inter.user.username} - ${query} - ${results.loadType} - ${results.tracks.length} tracks`)

        if (!player.playing) await player.play();

    }

    async autocomplete(client: MusicClient, inter: AutocompleteInteraction<CacheType>) {
        const GuildID = inter.guildId;
        if (!GuildID) return;

        const VCID = (inter.member as GuildMember).voice.channelId;
        if (!VCID) inter.respond([{ name: "Debes unirte a un canal de voz para buscar canciones", value: "join_vc" }]);

        const focussedQuery = inter.options.getFocused();

        const player = client.getPlayerOrDefault(inter, GuildID);

        player.connect();
        if (player.voiceChannelId != VCID) return inter.respond([{ name: "Debes unirte al mismo canal de voz que el bot", value: "join_vc" }]);
        if (!focussedQuery.trim().length) return await inter.respond([{ name: "No se encontró ninguna canción", value: queryErrors.NO_RESULTS }]);

        const res = await client.music.search({ query: focussedQuery, requester: inter.user }) as SearchResult;

        if (!res.tracks.length) return inter.respond([{ name: "No se encontraron resultados", value: queryErrors.NO_RESULTS }]);

        if (res.loadType === "playlist") {
            this.startTOAutoComplete(inter.user.id, res);
            return inter.respond([{ name: `Playlist [${res.tracks.length} Tracks] - ${res.playlistInfo?.name ?? "Unknown Playlist"}`.slice(0, 100), value: "autocomplete_0" }]);
        }

        const options = res.tracks.slice(0, 25).map((track, index) => {
            return {
                name: `${formatMS_HHMMSS(track.duration)} ${track.title}`.slice(0, 100),
                value: `autocomplete_${index}`,
            };
        })


        this.startTOAutoComplete(inter.user.id, res);
        return inter.respond(options);

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

        if (res.loadType === "playlist") {
            await this.addTracks(player, res.tracks)

            const embed = createEmptyEmbed()
                .setAuthor({ name: `Agregando ${res.loadType} 🎧` })
                .setTitle(res.playlistInfo!.name)
                .setThumbnail(res.tracks[0]!.artworkUrl ?? "")
                .setColor('Green')

            for (let i = 0; i < Math.min(res.tracks.length, 3); i++) {
                embed.addFields({
                    name: `${res.tracks[i]!.title} `, value: `${res.tracks[i]!.author} - Duración: ${formatMS_HHMMSS(res.tracks[i]!.duration)
                        } `, inline: true
                });
            }

            embed.addFields({ name: `Se agregaron: `, value: `${res.tracks.length} canciones más`, inline: false });

            await (await replyEmbed({ interaction: inter, embed })).fetch();

        } else {
            const track = query.startsWith("autocomplete_") ? res.tracks[Number(query.replace("autocomplete_", ""))] : res.tracks[0];

            await this.addTracks(player, track!)

            await (await replyEmbed({
                interaction: inter,
                embed: createEmptyEmbed()
                    .setAuthor({ name: `Agregando ${titleCleaner(track!.title, track!.author)} 🎧` })
                    .setDescription(`Autor: ${track!.author} `)
                    .setThumbnail(track?.artworkUrl ?? "")
                    .setColor('Green')
                    .addFields(
                        { name: "Duración", value: formatMS_HHMMSS(track!.duration), inline: true },
                        { name: "Artista", value: track!.author, inline: true }
                    ),

            })).fetch()

        }

        // deleteAfterTimer(Msg, 15000)

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