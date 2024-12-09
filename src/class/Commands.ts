import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

import { BotClient } from "./BotClient.js";
import { CommandOptions, SubCommandOptions } from "../types/CommandsOptions";

declare type InteractionExecuteFN = (client: BotClient, interaction: ChatInputCommandInteraction<"cached">) => any;
declare type AutoCompleteExecuteFN = (client: BotClient, interaction: AutocompleteInteraction) => any

export class Command {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: InteractionExecuteFN;
    autocomplete?: AutoCompleteExecuteFN;

    constructor(options: CommandOptions) {
        this.data = options.data;
        this.execute = options.execute;
        this.autocomplete = options.autocomplete; // Aseguramos asignar esta propiedad opcional
    }
}


type subCommandExecute = { [subCommandName: string]: InteractionExecuteFN };
type subCommandAutocomplete = { [subCommandName: string]: AutoCompleteExecuteFN };

export class SubCommand {
    data: SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: subCommandExecute;
    autocomplete?: subCommandAutocomplete;

    constructor(options: SubCommandOptions) {
        this.data = options.data
        this.execute = options.execute
    }

}