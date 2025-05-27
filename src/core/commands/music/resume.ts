import logger from "@/bot/logger.js";
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { createEmptyEmbed } from "@/utils/tools.js";


export default new SlashCommand()
    .setName("resume")
    .setDescription("Reanuda la reproducción de música")
    .setCategory("Music")
    .setExecute(
        async (client, interaction) => {
            if (!interaction.guildId) return;

            const guildID = interaction.guildId;
            const player = client.getPlayer(guildID);
            const embErr = createEmptyEmbed()
                .setDescription("No hay nada que reanudar. Usa /play para comenzar la reproducción o /pause para pausarla.");

            // Verificar si el reproductor existe y está pausado
            if (!player?.paused) {
                return await interaction.reply({
                    embeds: [embErr]
                });
            }

            // Verificar si el bot está en un canal de voz
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
                // Reanudar la reproducción
                await player.resume();
                interaction.reply({
                    embeds: [
                        createEmptyEmbed()
                            .setTitle("▶️ Reanudando")
                            .setDescription(player.queue.current ? player.queue.current.info.title : "Reproducción reanudada.")
                    ]
                });
            } catch (error) {
                if (error instanceof Error) {
                    logger.error("resume command", error);
                    logger.error(`Stack Trace: ${error.stack}`);
                } else {
                    logger.error('Ocurrió un error desconocido al registrar los comandos');
                }
                interaction.reply({
                    embeds: [
                        createEmptyEmbed()
                            .setDescription("Hubo un error al intentar reanudar la reproducción.")
                    ]
                });
            }
        }
    )

