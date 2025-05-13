import {
    AutocompleteInteraction, ChatInputCommandInteraction, Client, SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from "discord.js";

import type { LavalinkManager, MiniMap } from "lavalink-client";
import { BotClient } from "../class/BotClient";
import { TCommandCategoryOptions } from "./TCategoryOptions";

declare type InteractionExecuteFN = (client: BotClient, interaction: ChatInputCommandInteraction<"cached">) => any;
declare type AutoCompleteExecuteFN = (client: BotClient, interaction: AutocompleteInteraction) => any;

export interface ICustomRequester {
    id: string,
    username: string,
    avatar?: string,
}

export interface ICommand {
    data: {
        command: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
        category?: TCommandCategoryOptions
    }
    execute: InteractionExecuteFN;
    autocomplete?: AutoCompleteExecuteFN;
}

type subCommandExecute = { [subCommandName: string]: InteractionExecuteFN };
type subCommandAutocomplete = { [subCommandName: string]: AutoCompleteExecuteFN };

export interface SubCommand {
    data: {
        command: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
        category?: TCommandCategoryOptions
    }
    execute: subCommandExecute;
    autocomplete?: subCommandAutocomplete;
}

export interface Event {
    name: string,
    execute: (client: BotClient, ...params: any) => any;
}
