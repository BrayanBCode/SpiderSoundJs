import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";

export default new Command({
    data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Mezcla las canciones de la cola de reprodución"),
    execute: async (client, interaction) => {
        if (!interaction.guildId) return;

        const guildID = interaction.guildId;
        const player = client.Tools.getPlayer(guildID);
        const embErr = client.Tools.createEmbedTemplate()
            .setDescription("No hay canciones que mezclar, utiliza /play para agregar canciones")
            .setColor("Red");

        if (!player || !player.queue.tracks.length) return await interaction.reply({ embeds: [embErr] })

        const shuffledlenght = await player.queue.shuffle()

        await interaction.reply({
            embeds: [
                client.Tools.createEmbedTemplate()
                    .setAuthor({ name: `Se mezclaron ${shuffledlenght} canciones` })
                    .setDescription("Utiliza /queue para ver la lista de reprodución")
                    .setColor("Green")
            ]
        })
    }
})