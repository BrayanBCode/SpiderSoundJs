import { AutocompleteInteraction, ChatInputCommandInteraction, flatten, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

import { BotClient } from "./BotClient";
import { TCommandOptions, SubCommandOptions } from "../types/CommandsOptions";
import { TCommandCategoryOptions } from "../types/TCategoryOptions";

declare type InteractionExecuteFN = (client: BotClient, interaction: ChatInputCommandInteraction<"cached">) => any;
declare type AutoCompleteExecuteFN = (client: BotClient, interaction: AutocompleteInteraction) => any

export class Command {
    data: {
        command: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
        category?: TCommandCategoryOptions
    }
    execute: InteractionExecuteFN;
    autocomplete?: AutoCompleteExecuteFN;

    constructor(options: TCommandOptions) {
        this.data = options.data;
        this.execute = options.execute;
        this.autocomplete = options.autocomplete; // Aseguramos asignar esta propiedad opcional
    }

    setCategory(category: TCommandCategoryOptions) {
        this.data.category = category
        return this
    }
}


type subCommandExecute = { [subCommandName: string]: InteractionExecuteFN };
type subCommandAutocomplete = { [subCommandName: string]: AutoCompleteExecuteFN };

export class SubCommand {
    data: {
        command: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
        category?: TCommandCategoryOptions
    }
    execute: subCommandExecute;
    autocomplete?: subCommandAutocomplete;

    constructor(options: SubCommandOptions) {
        this.data = options.data
        this.execute = options.execute
    }

}