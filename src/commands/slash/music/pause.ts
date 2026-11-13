import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import { deleteAfterTimer, EmptyEmbed, replyEmbed } from "../../../utils/messages.js";
import { requireListener } from "../../../core/music/player.js";
import logger from "../../../core/client/logger.js";

export default new SlashCommand()
    .setName("pause")
    .setDescription("Pausa o reanuda la canción actual.")
    .setCategory("Music")
    .setExecute(
        async (client, inter) => {
            const player = await requireListener(client, inter);
            if (!player) return;

            if (!player.current)
                return deleteAfterTimer(await replyEmbed({
                    interaction: inter,
                    embed: EmptyEmbed().setDescription("❌ | No hay ninguna canción reproduciéndose.").setColor("Red"),
                    ephemeral: true,
                }), 15000);

            const pausing = !player.paused;
            if (pausing) await player.pause();
            else await player.resume();

            logger.info(`[/pause] ${inter.user.username} ${pausing ? "pausó" : "reanudó"} la reproducción en ${inter.guild.name}`);

            deleteAfterTimer(await replyEmbed({
                interaction: inter,
                embed: EmptyEmbed()
                    .setAuthor({ name: pausing ? "⏸️ | Pausa" : "▶️ | Reanudar", iconURL: inter.user.displayAvatarURL() })
                    .setDescription(pausing ? "La canción actual fue pausada." : "La reproducción continúa.")
                    .setColor("Green")
            }), 5000);
        })
