import type MusicClient from "@/client/MusicClient";
import logger from "@/utils/logger";
import { SlashCommandBuilder, AutocompleteInteraction, ChatInputCommandInteraction, type Interaction, type CacheType, PermissionsBitField } from "discord.js";

export interface CommandOptions { name: string, description: string }
export type CommandCategory = "Administrador" | "Moderación" | "Default";

declare type InteractionExecuteFN = (client: MusicClient, interaction: ChatInputCommandInteraction<"cached">) => any;
declare type AutoCompleteExecuteFN = (client: MusicClient, interaction: AutocompleteInteraction) => any

export class SlashCommand extends SlashCommandBuilder {
    private execute?: InteractionExecuteFN;
    private autocomplete?: AutoCompleteExecuteFN;
    private category?: CommandCategory;

    public setExecute(method: InteractionExecuteFN) {
        this.execute = method;
        return this;
    }

    public setAutoComplete(method: AutoCompleteExecuteFN) {
        this.autocomplete = method;
        return this;
    }

    public get getExecute() {
        return this.execute;
    }

    public get getAutocomplete() {
        return this.autocomplete;
    }

    public setCategory(category: CommandCategory) {
        this.category = category;
        return this;
    }

    public get getCategory() {
        return this.category || "Default";
    }

    // public toJson() {
    //     return {
    //         name: this.name,
    //         description: this.description,
    //     };
    // }

}

/*
 * Funcion encargada de controlar los eventos de ejecucion de comandos.
 * Se debe llamar en el evento "interactionCreate" del cliente de discord, y se encargara de ejecutar el comando correspondiente segun el nombre del comando.
 * 
 * La funcion debe controlar tanto la ejecucion de comandos como la ejecucion de autocompletados, y debe manejar los errores que puedan ocurrir durante la ejecucion de los comandos.
 * 
 * @param bot El cliente de discord.
 * @returns void
 * 
 */
export function CommandController(bot: MusicClient, interaction: Interaction<CacheType>) {

    if (interaction.isChatInputCommand()) {
        const cmd = bot.commandCol.get(interaction.commandName);
        if (!cmd?.getExecute) return;

        if (cmd.getCategory === "Administrador" && !interaction.memberPermissions?.has(PermissionsBitField.Flags.ModerateMembers)) {
            interaction.reply({ content: "❌ | No tienes permisos para ejecutar este comando.", ephemeral: true });
            return;
        }

        try {
            cmd.getExecute(bot, interaction as ChatInputCommandInteraction<"cached">);
            logger.info(`Comando ejecutado: ${interaction.commandName} | Usuario: ${interaction.user.tag} | Servidor: ${interaction.guild ? interaction.guild.name : "DM"} | Categoría: ${cmd.getCategory}`);
        } catch (error) {
            logger.error(`Error al ejecutar el comando ${interaction.commandName}: ${error}`);
            interaction.reply({ content: "❌ | Ocurrió un error al ejecutar este comando.", ephemeral: true });
        }
    }

    if (interaction.isAutocomplete()) {
        const cmd = bot.commandCol.get(interaction.commandName);
        if (!cmd?.getAutocomplete) return;

        try {
            cmd.getAutocomplete(bot, interaction as AutocompleteInteraction);
        } catch (error) {
            logger.error(`Error al ejecutar el autocompletado del comando ${interaction.commandName}: ${error}`);
        }
    }

}