import { Command } from "@/structures/commands/Commands.js";
import { createEmptyEmbed } from "@/utils/tools.js";
import { SlashCommandBuilder } from "discord.js";


export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("shuffle")
            .setDescription("Mezcla las canciones de la cola de reprodución"), category: 'Music'
    },
    execute: async (client, interaction) => {
        if (!interaction.guildId) return;

        const guildID = interaction.guildId;
        const player = client.getPlayer(guildID);
        const embErr = createEmptyEmbed()
            .setDescription("No hay canciones que mezclar, utiliza /play para agregar canciones")
            .setColor("Red");

        if (!player?.queue?.tracks.length) return await interaction.reply({ embeds: [embErr] })

        const shuffledlenght = await player.queue.shuffle()

        await interaction.reply({
            embeds: [
                createEmptyEmbed()
                    .setAuthor({ name: `Se mezclaron ${shuffledlenght} canciones` })
                    .setDescription("Utiliza /queue para ver la lista de reprodución")
                    .setColor("Green")
            ]
        })
    }
})