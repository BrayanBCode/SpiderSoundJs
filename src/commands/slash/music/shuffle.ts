import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import { deleteAfterTimer, EmptyEmbed, replyEmbed } from "../../../utils/messages.js";
import { requireListener } from "../../../core/music/player.js";
import logger from "../../../core/client/logger.js";

export default new SlashCommand()
    .setName("shuffle")
    .setDescription("Mezcla las canciones de la cola.")
    .setCategory("Music")
    .setExecute(
        async (client, inter) => {
            const player = await requireListener(client, inter);
            if (!player) return;

            if (player.queue.size < 2)
                return deleteAfterTimer(await replyEmbed({
                    interaction: inter,
                    embed: EmptyEmbed().setDescription("❌ | Hacen falta al menos 2 canciones en la cola para mezclar.").setColor("Yellow"),
                    ephemeral: true,
                }), 15000);

            // player.shuffle (no queue.shuffle): emite playerTriggeredShuffle y el PlayerMessage actualiza "Siguiente"
            player.shuffle();
            logger.info(`[/shuffle] ${inter.user.username} mezcló ${player.queue.size} canciones en ${inter.guild.name}`);

            return inter.reply({ embeds: [EmptyEmbed().setDescription(`🔀 Cola mezclada (${player.queue.size} canciones)`).setColor("Green")] });
        }
    )
