import { deleteAfterTimer, EmptyEmbed, replyEmbed } from "../../../utils/messages.js";
import { requireListener } from "../../../core/music/player.js";
import { SlashCommand } from "../../../core/classes/SlashCommand.js";

export default new SlashCommand()
    .setName("clear")
    .setDescription("Limpia la lista de reproducción.")
    .setCategory("Music")

    .setExecute(
        async (client, inter) => {
            const player = await requireListener(client, inter);
            if (!player) return;

            if (!player.queue.size)
                return deleteAfterTimer(
                    await replyEmbed({
                        interaction: inter,
                        embed: EmptyEmbed()
                            .setDescription("❌ | No hay canciones en la lista de reproducción.")
                            .setColor("Red"),
                        ephemeral: true,
                    }), 15000);

            player.queue.clear();

            return inter.reply({
                embeds: [
                    EmptyEmbed()
                        .setAuthor({ name: "🗑️ | Limpiar lista de reproducción", iconURL: inter.user.displayAvatarURL() })
                        .setDescription("La lista de reproducción ha sido limpiada.")
                        .setColor("Green")
                ]
            });
        }
    )                               