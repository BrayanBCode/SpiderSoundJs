import { BotClient } from "@/bot/BotClient.js";
import { TextChannel } from "discord.js";
import { Player } from "lavalink-client";


export interface IPlayerButtons {
    time?: number | undefined;
    player: Player;
    TextChannel: TextChannel;
    client: BotClient;
}