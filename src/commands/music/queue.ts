import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";
import { createEmptyEmbed } from "../../utils/tools.js";
import { QueuePaginator } from "../../class/buttons/QueuePaginator.js";

export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("queue")
            .setDescription("Muestra el listado de canciones en la cola de reproducción."),
        category: 'Music'
    },

    execute: async (client, interaction) => {
        if (!interaction.guildId) return;

        const player = client.getPlayer(interaction.guildId);

        if (!player || player.queue.tracks.length === 0) return interaction.reply({
            embeds: [
                createEmptyEmbed()
                    .setDescription("La lista de reproducción está vacía, utiliza /play para agregar canciones.")
            ]
        });

        const paginator = new QueuePaginator({ interaction, items: player.queue.tracks })
        await paginator.reply(true)
    },
});
