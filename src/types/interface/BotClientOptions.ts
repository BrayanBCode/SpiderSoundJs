import { GatewayIntentBits } from "discord.js";
import { LavalinkManager } from "lavalink-client";
import { ICommand, SubCommand } from "../types/Client.js";
import { PrefixCommand } from "@/structures/commands/PrefixCommand.js";


export interface BotClientOptions {
    intents: GatewayIntentBits[]
    lavalink?: LavalinkManager;
    prefixCommands?: Map<string, PrefixCommand>;
    slashCommands?: Map<string, ICommand | SubCommand>;
    defaultVolume?: number;
    debugMode?: boolean;
}
