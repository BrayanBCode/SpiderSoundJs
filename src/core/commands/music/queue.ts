import { QueuePaginator } from "@/modules/buttons/QueuePaginator.js";
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { createEmptyEmbed } from "@/utils/tools.js";


export default new SlashCommand()
    .setName("queue")
    .setDescription("Muestra el listado de canciones en la cola de reproducción.")
    .setCategory("Music")


    .setExecute(async (client, interaction) => {
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
    })
