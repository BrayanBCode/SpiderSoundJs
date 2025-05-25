import { GatewayIntentBits } from "discord.js";
import { LavalinkManager } from "lavalink-client";
import { ICommand, SubCommand } from "../types/Client.js";


export interface BotClientOptions {
    intents: GatewayIntentBits[]
    lavalink?: LavalinkManager;
    commands?: Map<string, ICommand | SubCommand>;
    defaultVolume?: number;
    debugMode?: boolean;
}
