import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import { deleteAfterTimer, EmptyEmbed, replyEmbed } from "../../../utils/messages.js";
import { getRequesterInfo, requireListener, respondQueuePositions, trackActionEmbed } from "../../../core/music/player.js";
import logger from "../../../core/client/logger.js";

export default new SlashCommand()
    .setName("move")
    .setDescription("Mueve una canción de la cola a otra posición.")
    .setCategory("Music")
    .setExecute(
        async (client, inter) => {
            const player = await requireListener(client, inter);
            if (!player) return;

            // Posiciones desde 1, como en /queue
            const from = inter.options.getNumber("desde", true);
            const to = inter.options.getNumber("hasta", true);
            const track = player.queue.get(from - 1);
            const size = player.queue.size;

            if (!track || to < 1 || to > size || from === to)
                return deleteAfterTimer(await replyEmbed({
                    interaction: inter,
                    embed: EmptyEmbed()
                        .setDescription(!size ? "❌ | No hay canciones en la cola."
                            : from === to ? "❌ | La canción ya está en esa posición."
                            : `❌ | Las posiciones van de 1 a ${size}.`)
                        .setColor("Red"),
                    ephemeral: true,
                }), 15000);

            player.queue.move(from - 1, to - 1);
            logger.info(`[/move] ${inter.user.username} movió "${track.title}" de ${from} a ${to} en ${inter.guild.name}`);

            return inter.reply({ embeds: [trackActionEmbed("Canción movida ↕️", track, getRequesterInfo(inter.member), `\nPosición **${from}** → **${to}**`)] });
        }
    )
    .setAutoComplete((client, inter) => respondQueuePositions(client, inter))
    .addNumberOption(o => o.setName("desde").setDescription("Posición actual de la canción.").setAutocomplete(true).setRequired(true))
    .addNumberOption(o => o.setName("hasta").setDescription("Posición nueva (1 = la siguiente).").setAutocomplete(true).setRequired(true))
