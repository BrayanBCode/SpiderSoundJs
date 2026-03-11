import { SlashCommand } from "@/src/Base/discord/SlashCommand";
import { QueuePaginator } from "@/ui/QueuePaginator";
import { createEmptyEmbed } from "@/utils/tools";


export default new SlashCommand()
    .setName("queue")
    .setDescription("Muestra la lista de reproducción actual.")
    .setExecute(
        async (client, inter) => {
            if (!inter.guildId) return;

            const player = client.getPlayer(inter.guildId);

            if (!player || player.queue.tracks.length === 0) return inter.reply({
                embeds: [
                    createEmptyEmbed()
                        .setDescription("La lista de reproducción está vacía, utiliza /play para agregar canciones.")
                ]
            });

            const paginator = new QueuePaginator({ interaction: inter, items: player.queue.tracks })
            await paginator.reply(true)
        }
    )