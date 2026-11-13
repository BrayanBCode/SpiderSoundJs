import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import { deleteAfterTimer, EmptyEmbed, replyEmbed } from "../../../utils/messages.js";
import { requireListener, respondQueuePositions } from "../../../core/music/player.js";
import logger from "../../../core/client/logger.js";

export default new SlashCommand()
    .setName("remove")
    .setDescription("Elimina la canción en la posición indicada de la lista de reproducción.")
    .setCategory("Music")
    .setExecute(
        async (client, inter) => {
            const player = await requireListener(client, inter);
            if (!player) return;

            const pos = inter.options.getNumber("position", true); // empieza en 1, como en /queue
            const track = player.queue.get(pos - 1);

            if (!track)
                return deleteAfterTimer(await replyEmbed({
                    interaction: inter,
                    embed: EmptyEmbed()
                        .setDescription(player.queue.size
                            ? `❌ | No hay ninguna canción en la posición ${pos}.`
                            : "❌ | No hay canciones en la lista de reproducción.")
                        .setColor("Red"),
                    ephemeral: true,
                }), 15000);

            player.queue.remove(pos - 1);
            logger.info(`[/remove] ${inter.user.username} quitó "${track.title}" (posición ${pos}) en ${inter.guild.name}`);

            return inter.reply({
                embeds: [
                    EmptyEmbed()
                        .setAuthor({ name: "🗑️ | Canción eliminada", iconURL: inter.user.displayAvatarURL() })
                        .addFields([
                            { name: "Título", value: `[${track.title}](${track.uri})`, inline: true },
                            { name: "Artista", value: track.author, inline: true },
                        ])
                        .setThumbnail(track.artworkUrl ?? null)
                        .setFooter({ text: `Solicitado por: ${inter.user.tag}` })
                        .setColor("Green")
                ]
            });
        }
    )
    .setAutoComplete((client, inter) => respondQueuePositions(client, inter))
    .addNumberOption(
        o => o
            .setName("position")
            .setDescription("Posición de la canción que quieres eliminar.")
            .setAutocomplete(true)
            .setRequired(true))
