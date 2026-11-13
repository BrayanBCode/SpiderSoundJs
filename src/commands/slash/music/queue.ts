import { QueuePaginator } from "../../../core/classes/music/QueuePaginator.js";
import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import { EmptyEmbed } from "../../../utils/messages.js";

export default new SlashCommand()
    .setName("queue")
    .setDescription("Muestra la lista de reproducción actual.")
    .setCategory("Music")
    .setExecute(
        async (client, inter) => {
            if (!inter.guildId) return;

            const player = client.getPlayer(inter.guildId);

            if (!player || player.queue.tracks.length === 0) return inter.reply({
                embeds: [
                    EmptyEmbed()
                        .setDescription("La lista de reproducción está vacía, utiliza /play para agregar canciones.")
                ]
            });

            const paginator = new QueuePaginator({ interaction: inter, items: player.queue.tracks })
            await paginator.reply(true)
        }
    )