import { ChatInputCommandInteraction, ButtonInteraction, TextChannel } from "discord.js"
import { Track, UnresolvedTrack } from "lavalink-client";

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