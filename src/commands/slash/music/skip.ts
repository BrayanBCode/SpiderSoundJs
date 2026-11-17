import { SlashCommand } from "../../../core/classes/SlashCommand.js"
import { EmptyEmbed, deleteAfterTimer, replyEmbed } from "../../../utils/messages.js";
import { getRequesterInfo, requireListener, respondQueuePositions, skipTrack, trackActionEmbed } from "../../../core/music/player.js";
import logger from "../../../core/client/logger.js";


export default new SlashCommand()
    .setName("skip")
    .setDescription("Pasa a la siguiente canción, o salta a una posición de la cola sin borrar las del medio.")
    .setCategory("Music")
    .setExecute(
        async (client, inter) => {
            const player = await requireListener(client, inter);
            if (!player) return;


            // Con loop de cola, saltar la única canción la vuelve a poner desde el principio
            if (!player.queue.size && player.loop !== "queue") {
                return deleteAfterTimer(
                    await replyEmbed({
                        interaction: inter,
                        embed: EmptyEmbed()
                            .setDescription("❌ | No hay canciones en la lista de reproducción.")
                            .setColor("Red"),
                        ephemeral: true,
                    }), 15000);
            }

            const pos = inter.options.getNumber("position") ?? 1; // empieza en 1, como en /queue

            const track = pos >= 1 ? await skipTrack(player, pos - 1) : undefined;

            if (!track)
                return deleteAfterTimer(
                    await replyEmbed({
                        interaction: inter,
                        embed: EmptyEmbed()
                            .setDescription(`❌ | No hay ninguna canción en la posición ${pos}.`)
                            .setColor("Red"),
                        ephemeral: true,
                    }), 15000);

            logger.info(`[/skip] ${inter.user.username} saltó a "${track.title}" (posición ${pos}) en ${inter.guild.name}`);

            const header = pos > 1 ? `Saltó a la posición ${pos} ⏭️` : "Siguiente canción ⏭️";
            return inter.reply({ embeds: [trackActionEmbed(header, track, getRequesterInfo(inter.member))] });
        }
    )
    .setAutoComplete((client, inter) => respondQueuePositions(client, inter))
    .addNumberOption(
        o => o
            .setName("position")
            .setDescription("Especifica la posición a la que deseas saltar en la lista de reproducción.")
            .setAutocomplete(true)
            .setRequired(false))