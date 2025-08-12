import { GatewayIntentBits } from "discord.js";
import { PrefixCommand } from "@/structures/commands/PrefixCommand.js";
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { WithOutPrefix } from "@/structures/commands/WithOutPrefix.js";


export interface BotClientOptions {
    intents: GatewayIntentBits[]
    prefixCommands?: Map<string, PrefixCommand>
    slashCommands?: Map<string, SlashCommand>
    withOutPrefixCommands?: Map<string, WithOutPrefix>
    defaultVolume?: number;
    debugMode?: boolean;
}
