import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { BotClient } from "../class/BotClient";
import { TCommandCategoryOptions } from "./TCategoryOptions";

declare type InteractionExecuteFN = (client: BotClient, interaction: ChatInputCommandInteraction<"cached">) => any;
declare type AutoCompleteExecuteFN = (client: BotClient, interaction: AutocompleteInteraction) => any;


export interface TCommandOptions {
    data: {
        command: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
        category?: TCommandCategoryOptions
    }
    execute: InteractionExecuteFN;
    autocomplete?: AutoCompleteExecuteFN;
}



type subCommandExecute = { [subCommandName: string]: InteractionExecuteFN };
type subCommandAutocomplete = { [subCommandName: string]: AutoCompleteExecuteFN };

export interface SubCommandOptions {
    data: {
        command: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
        category?: TCommandCategoryOptions
    }
    execute: subCommandExecute;
    autocomplete?: subCommandAutocomplete;
}
