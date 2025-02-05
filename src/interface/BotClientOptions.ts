import { LavalinkManager } from "lavalink-client/dist/types/index.js";
import { ICommand, SubCommand } from "../types/Client.js";
import { GatewayIntentBits } from "discord.js";

export interface BotClientOptions {
    intents: GatewayIntentBits[]
    lavalink?: LavalinkManager;
    commands?: Map<string, ICommand | SubCommand>;
    defaultVolume?: number;
    debugMode?: boolean;
}
