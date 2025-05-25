import { ChatInputCommandInteraction } from "discord.js";
import { Player, SearchResult } from "lavalink-client";


export interface IAddToQueueParams {
    player: Player;
    res: SearchResult;
    query: string;
    inter: ChatInputCommandInteraction<"cached">;
}