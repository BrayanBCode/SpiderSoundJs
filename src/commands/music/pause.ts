import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";
import logger from "../../class/logger.js";

export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("pause")
            .setDescription("Pausa la reproducción de música"),
        category: "Music"
    },
    execute: async (client, interaction) => {
        if (!interaction.guildId) return;

        const guildID = interaction.guildId;
        const player = client.Tools.getPlayer(guildID);
        const embErr = client.Tools.createEmbedTemplate()
            .setDescription("No hay nada que pausar o ya está pausado. Usa /play o /resume para agregar o reanudar la reproducción.");

        // Verifica si hay un reproductor activo y si no está ya pausado
        if (!player || player.paused) {
            return await interaction.reply({
                embeds: [embErr]
            });
        }

        // Asegúrate de que el bot esté en un canal de voz
        const guild = await client.guilds.fetch(guildID);
        const voiceChannel = guild.members.me?.voice.channel;

        if (!voiceChannel) {
            return await interaction.reply({
                embeds: [
                    client.Tools.createEmbedTemplate()
                        .setDescription("El bot no está conectado a un canal de voz.")
                ]
            });
        }

        try {
            // Pausa la reproducción
            await player.pause();
            interaction.reply({
                embeds: [
                    client.Tools.createEmbedTemplate()
                        .setTitle("⏸️ Pausando")
                        .setDescription(player.queue.current ? player.queue.current.info.title : "Reproducción pausada.")
                ]
            });
        } catch (error) {
            if (error instanceof Error) {
                logger.error(error);
                logger.error(`Stack Trace: ${error.stack}`);
            } else {
                logger.error('Ocurrió un error desconocido al registrar los comandos');
            }
            interaction.reply({
                embeds: [
                    client.Tools.createEmbedTemplate()
                        .setDescription("Hubo un error al intentar pausar la reproducción.")
                ]
            });
        }
    }
});
