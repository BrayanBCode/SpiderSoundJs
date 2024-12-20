import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";

export default new Command({
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Reanuda la reproducción de música"),
    execute: async (client, interaction) => {
        if (!interaction.guildId) return;

        const guildID = interaction.guildId;
        const player = client.Tools.getPlayer(guildID);
        const embErr = client.Tools.createEmbedTemplate()
            .setDescription("No hay nada que reanudar. Usa /play para comenzar la reproducción o /pause para pausarla.");

        // Verificar si el reproductor existe y está pausado
        if (!player || !player.paused) {
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
                    client.Tools.createEmbedTemplate()
                        .setDescription("El bot no está conectado a un canal de voz.")
                ]
            });
        }

        try {
            // Reanudar la reproducción
            await player.resume();
            interaction.reply({
                embeds: [
                    client.Tools.createEmbedTemplate()
                        .setTitle("▶️ Reanudando")
                        .setDescription(player.queue.current ? player.queue.current.info.title : "Reproducción reanudada.")
                ]
            });
        } catch (error) {
            console.error(error);
            interaction.reply({
                embeds: [
                    client.Tools.createEmbedTemplate()
                        .setDescription("Hubo un error al intentar reanudar la reproducción.")
                ]
            });
        }
    }
});
