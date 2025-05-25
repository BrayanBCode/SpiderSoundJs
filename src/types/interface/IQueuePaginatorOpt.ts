import { ChatInputCommandInteraction, ButtonInteraction, TextChannel } from "discord.js"
import { Track, UnresolvedTrack } from "lavalink-client";

export interface IQueuePaginatorOpt {
    interaction: ChatInputCommandInteraction<"cached"> | ButtonInteraction<"cached">;
    items: (Track | UnresolvedTrack)[];
    textChannel?: TextChannel;
    pageSize?: number;
    timer?: number;

}