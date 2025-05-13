import { ChatInputCommandInteraction } from "discord.js";
import { Player, SearchResult } from "lavalink-client/dist/types";

export interface IAddToQueueParams {
    player: Player;
    res: SearchResult;
    query: string;
    inter: ChatInputCommandInteraction<"cached">;
}