import { ChatInputCommandInteraction, CommandInteractionOptionResolver, Interaction, MessageFlags } from "discord.js";
import { BotClient } from "../../class/BotClient.js";
import { Command, SubCommand } from "../../class/Commands.js";
import { BaseDiscordEvent } from "../../class/events/BaseDiscordEvent.js";
import logger from "../../class/logger.js";


export default class InteractionCreate extends BaseDiscordEvent<"interactionCreate"> {
    name: "interactionCreate" = "interactionCreate";
    once: boolean = false;
    async execute(client: BotClient, interaction: Interaction) {

        // Verifica si la interacción es un comando o una interacción de autocompletado
        if (!interaction.isCommand() && !interaction.isAutocomplete()) return;

        // Obtiene el subcomando si existe, de lo contrario devuelve null
        const subCommand = (interaction.options as CommandInteractionOptionResolver).getSubcommand(false);

        // Busca el comando en la colección de comandos registrados
        const command = client.commands.get(interaction.commandName);

        if (!command) return logger.error(`No se encontró un comando que coincida con ${interaction.commandName}.`);

        logger.debug(`Se utilizo el comando **${interaction.commandName}** en ${interaction.guild?.name}`)

        try {
            if (interaction.isCommand()) {
                // Si hay un subcomando, verifica si tiene una función para ejecutarlo
                if (subCommand) {
                    if (typeof (command as SubCommand).execute[subCommand] !== "function") {
                        return logger.error(`[Error-Comando] El subcomando "${subCommand}" no tiene una función "execute".`);
                    }
                    // Ejecuta la función del subcomando
                    return await (command as SubCommand).execute[subCommand](client, interaction as ChatInputCommandInteraction<"cached">);
                }
                // Si no hay subcomando, ejecuta el comando principal
                return await (command as Command).execute(client, interaction as ChatInputCommandInteraction<"cached">);
            }

            if (interaction.isAutocomplete()) {
                // Si hay un subcomando, verifica si tiene una función de autocompletado
                if (subCommand) {
                    if (typeof (command as SubCommand).autocomplete?.[subCommand] !== "function") {
                        return logger.error(`[Error-Comando] El subcomando "${subCommand}" no tiene una función "autocomplete".`);
                    }
                    // Ejecuta la función de autocompletado del subcomando
                    return await (command as SubCommand).autocomplete?.[subCommand](client, interaction);
                }

                // Verifica si el comando principal tiene una función de autocompletado
                if (!(command as Command).autocomplete) {
                    return logger.error(`[Error-Comando] El comando principal no tiene una función "autocomplete".`);
                }
                // Ejecuta la función de autocompletado del comando principal
                return await (command as Command).autocomplete?.(client, interaction);
            }
        } catch (error) {
            logger.error("[interactionCreate]", error);
            if (interaction.isAutocomplete()) return;

            // Envía un mensaje de error al usuario según si la interacción ya fue respondida o no
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '¡Ocurrió un error al ejecutar este comando!', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: '¡Ocurrió un error al ejecutar este comando!', flags: MessageFlags.Ephemeral });
            }
        };

    }

}
