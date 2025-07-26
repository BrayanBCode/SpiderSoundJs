import { ChatInputCommandInteraction, ButtonInteraction, TextChannel } from "discord.js"
import { Player, SearchResult, Track, UnresolvedTrack } from "lavalink-client";

export interface IQueuePaginatorOpt {
    interaction: ChatInputCommandInteraction<"cached"> | ButtonInteraction<"cached">;
    items: (Track | UnresolvedTrack)[];
    textChannel?: TextChannel;
    pageSize?: number;
    timer?: number;

}


export interface IQueuePaginator {
    interaction: ChatInputCommandInteraction<"cached"> | ButtonInteraction<"cached">;
    items: (Track | UnresolvedTrack)[];
    pageSize?: number;
    time?: number;
}


export interface IClassQueuePaginator {
    interaction: ChatInputCommandInteraction<"cached"> | ButtonInteraction<"cached">;
    items: (Track | UnresolvedTrack)[];
    textChannel?: TextChannel;
    pageSize: number;
    timer?: number;

    reply(ephemeral: boolean): any;
    followUp(ephemeral: boolean): any;
    send(): any;

}


export interface IAddToQueueParams {
    player: Player;
    res: SearchResult;
    query: string;
    inter: ChatInputCommandInteraction<"cached">;
}