import { LavalinkManager } from "lavalink-client/dist/types";
import { Command, SubCommand } from "../types/Client.js";
import { GatewayIntentBits } from "discord.js";

export interface BotClientOptions {
    intents: GatewayIntentBits[]
    lavalink?: LavalinkManager;
    commands?: Map<string, Command | SubCommand>;
    defaultVolume?: number;
    debugMode?: boolean;
}