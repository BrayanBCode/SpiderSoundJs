import { QueuePaginator } from "../../../core/classes/music/QueuePaginator.js";
import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import { MessageFlags } from "discord.js";
import { EmptyEmbed } from "../../../utils/messages.js";

export default new SlashCommand()
    .setName("queue")
    .setDescription("Muestra lo que suena y lo que sigue en la cola (solo vos la ves).")
    .setCategory("Music")
    .setExecute(
        async (client, inter) => {
            if (!inter.guildId) return;

            const player = client.getPlayer(inter.guildId);

            if (!player || (!player.current && player.queue.tracks.length === 0)) return inter.reply({
                embeds: [
                    EmptyEmbed()
                        .setDescription("La lista de reproducción está vacía, utiliza /play para agregar canciones.")
                ],
                flags: MessageFlags.Ephemeral
            });

            await new QueuePaginator({ interaction: inter, player }).reply()
        }
    )