import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { BotClient } from "../class/BotClient";

declare type InteractionExecuteFN = (client: BotClient, interaction: ChatInputCommandInteraction<"cached">) => any;
declare type AutoCompleteExecuteFN = (client: BotClient, interaction: AutocompleteInteraction) => any;


export interface CommandOptions {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | any;
    execute: InteractionExecuteFN;
    autocomplete?: AutoCompleteExecuteFN;
}



type subCommandExecute = { [subCommandName: string]: InteractionExecuteFN };
type subCommandAutocomplete = { [subCommandName: string]: AutoCompleteExecuteFN };

export interface SubCommandOptions {
    data: SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandSubcommandsOnlyBuilder | any;
    execute: subCommandExecute;
    autocomplete?: subCommandAutocomplete;
}
