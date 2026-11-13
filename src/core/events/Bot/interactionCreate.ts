import { Interaction, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { DEvent } from "../../classes/events/DEvent.js";
import { BClient } from "../../client/BClient.js";
import logger from "../../client/logger.js";


export default class InteractionCreate extends DEvent<"interactionCreate"> {
    constructor() {
        super("interactionCreate");
    }


    async execute(client: BClient, interaction: Interaction) {

        // Verifica si la interacción es un comando o una interacción de autocompletado
        if (!interaction.isCommand() && !interaction.isAutocomplete()) return;

        // Busca el comando en la colección de comandos registrados
        const command = client.slashCommands.get(interaction.commandName);

        if (!command) return logger.error(`[interactionCreate] No se encontró un comando que coincida con ${interaction.commandName}.`);

        try {
            if (interaction.isCommand() && command.getExecute) {
                // Si no hay subcomando, ejecuta el comando principal
                logger.debug(`[interactionCreate] executing: ${interaction.commandName}`);
                return await command.getExecute(client, interaction as ChatInputCommandInteraction<"cached">);
            }

            if (interaction.isAutocomplete() && command.getAutocomplete) {
                // Ejecuta la función de autocompletado del comando principal
                logger.debug(`[interactionCreate] autocomplete: ${interaction.commandName}`);
                return await command.getAutocomplete(client, interaction);
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
