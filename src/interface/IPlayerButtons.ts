import { TextChannel } from "discord.js";
import { Player } from "lavalink-client/dist/types";
import { BotClient } from "../class/BotClient";

export interface IPlayerButtons {
    time?: number | undefined;
    player: Player;
    TextChannel: TextChannel;
    client: BotClient;
}