import { BotClient } from "@/bot/BotClient.js";
import { TCommandCategoryOptions } from "@/types/types/TCategoryOptions.js";
import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";


declare type InteractionExecuteFN = (client: BotClient, interaction: ChatInputCommandInteraction<"cached">) => any;
declare type AutoCompleteExecuteFN = (client: BotClient, interaction: AutocompleteInteraction) => any


export class SlashCommand extends SlashCommandBuilder {
    private type: "slash" = "slash"
    private execute?: InteractionExecuteFN
    private autocomplete?: AutoCompleteExecuteFN
    private _category?: TCommandCategoryOptions

    public setExecute(method: InteractionExecuteFN) {
        this.execute = method
        return this
    }
    public setAutoComplete(method: AutoCompleteExecuteFN) {
        this.autocomplete = method
        return this
    }

    public setCategory(category: TCommandCategoryOptions) {
        this._category = category
        return this
    }

    public get getExecute() {
        return this.execute
    }

    public get getAutocomplete() {
        return this.autocomplete
    }

    public get getCategory() {
        return this._category
    }

    public get getType() {
        return this.type
    }

}

