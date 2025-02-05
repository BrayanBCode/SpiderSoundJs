import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";
import { formatMS_HHMMSS } from "../../utils/formatMS_HHMMSS.js";
import { QueuePaginator } from "../../class/buttons/QueuePaginator.js";

export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("queue")
            .setDescription("Muestra el listado de canciones en la cola de reproducción"),
        category: 'Music'
    },

    execute: async (client, interaction) => {
        if (!interaction.guildId) return;

        const player = client.Tools.getPlayer(interaction.guildId);

        if (!player) return interaction.reply({
            embeds: [
                client.Tools.createEmbedTemplate()
                    .setDescription("La lista de reproducción está vacía, utiliza /play para agregar canciones.")
            ]
        });

        const queue = player.queue;

        if (!queue.tracks.length) return await interaction.reply({
            embeds: [
                client.Tools.createEmbedTemplate()
                    .setDescription("La lista de reproducción está vacía, utiliza /play para agregar canciones.")
                    .addFields({
                        name: `${player.playing ? `Se está reproduciendo` : ""}`,
                        value: `${player.playing ? queue.current?.info.title : ""}`
                    })
            ]
        });

        const tracks = queue.tracks;
        const chunkSize = 10;
        const pages: EmbedBuilder[] = [];

        for (let i = 0; i < tracks.length; i += chunkSize) {
            const chunk = tracks.slice(i, i + chunkSize);
            const description = chunk.map((track: any, index: number) => {
                return `**${i + index + 1}.** [${track.info.title}](${track.info.uri}) - \`${track.info.author}\` \`${formatMS_HHMMSS(track.info.duration)}\``;
            }).join("\n");

            const embed = new EmbedBuilder()
                .setTitle("Cola de Reproducción")
                .setDescription(description)
                .setColor("Blue");

            pages.push(embed);
        }

        const paginator = new QueuePaginator(interaction, pages);
        await paginator.start();
    },
});
