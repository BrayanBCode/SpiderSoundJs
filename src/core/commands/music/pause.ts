import logger from "@/bot/logger.js";
import { Command } from "@/structures/commands/Commands.js";
import { createEmptyEmbed } from "@/utils/tools.js";
import { SlashCommandBuilder } from "discord.js";


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
        const player = client.getPlayer(guildID);
        const embErr = createEmptyEmbed()
            .setDescription("No hay nada que pausar o ya está pausado. Usa /play o /resume para agregar o reanudar la reproducción.");

        if (!player || player.paused) {
            return await interaction.reply({
                embeds: [embErr]
            });
        }

        const guild = await client.guilds.fetch(guildID);
        const voiceChannel = guild.members.me?.voice.channel;

        if (!voiceChannel) {
            return await interaction.reply({
                embeds: [
                    createEmptyEmbed()
                        .setDescription("El bot no está conectado a un canal de voz.")
                ]
            });
        }

        try {
            await player.pause();
            interaction.reply({
                embeds: [
                    createEmptyEmbed()
                        .setTitle("⏸️ Pausando")
                        .setDescription(player.queue.current ? player.queue.current.info.title : "Reproducción pausada.")
                ]
            });
        } catch (error) {
            if (error instanceof Error) {
                logger.error("pause command", error);
                logger.error(`Stack Trace: ${error.stack}`);
            } else {
                logger.error('Ocurrió un error desconocido al registrar los comandos');
            }
            interaction.reply({
                embeds: [
                    createEmptyEmbed()
                        .setDescription("Hubo un error al intentar pausar la reproducción.")
                ]
            });
        }
    }
});
