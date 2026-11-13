import { SlashCommand } from "../../../core/classes/SlashCommand.js"
import { EmptyEmbed, deleteAfterTimer, replyEmbed } from "../../../utils/messages.js";
import { requireListener, respondQueuePositions, skipTrack } from "../../../core/music/player.js";
import logger from "../../../core/client/logger.js";


export default new SlashCommand()
    .setName("skip")
    .setDescription("Salta la canción actual o a la posición especificada en la lista de reproducción.")
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

            let pos = inter.options.getNumber("position");

            if (!pos) pos = 0;

            const track = await skipTrack(player, pos);

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

            return inter.reply({
                embeds: [
                    EmptyEmbed()
                        .setAuthor({ name: "⏭️ | Salto de canción", iconURL: inter.user.displayAvatarURL() })
                        .addFields([
                            { name: "title", value: `[${track.title}](${track.uri})`, inline: true },
                            { name: "artist", value: track.author, inline: true },
                        ])
                        .setThumbnail(track.artworkUrl ?? "")
                        .setFooter({ text: `Solicitado por: ${inter.user.tag}` })
                        .setColor("Green")

                ]
            })



        }
    )
    .setAutoComplete((client, inter) => respondQueuePositions(client, inter))
    .addNumberOption(
        o => o
            .setName("position")
            .setDescription("Especifica la posición a la que deseas saltar en la lista de reproducción.")
            .setAutocomplete(true)
            .setRequired(false))