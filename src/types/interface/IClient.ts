import { GatewayIntentBits } from "discord.js";
import { LavalinkManager } from "lavalink-client";
import { PrefixCommand } from "@/structures/commands/PrefixCommand.js";
import { SlashCommand } from "@/structures/commands/SlashCommand.js";


export interface BotClientOptions {
    intents: GatewayIntentBits[]
    lavalink?: LavalinkManager;
    prefixCommands?: Map<string, PrefixCommand>
    slashCommands?: Map<string, SlashCommand>
    defaultVolume?: number;
    debugMode?: boolean;
}
