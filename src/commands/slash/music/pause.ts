import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import { deleteAfterTimer, EmptyEmbed, replyEmbed } from "../../../utils/messages.js";
import { requireListener } from "../../../core/music/player.js";
import logger from "../../../core/client/logger.js";

export default new SlashCommand()
    .setName("pause")
    .setDescription("Pausa la canción actual.")
    .setCategory("Music")
    .setExecute(
        async (client, inter) => {
            const player = await requireListener(client, inter);
            if (!player) return;

            if (!player.current || player.paused)
                return deleteAfterTimer(await replyEmbed({
                    interaction: inter,
                    embed: EmptyEmbed()
                        .setDescription(player.paused
                            ? "⏸️ | La reproducción ya está en pausa. Usa /resume para continuar."
                            : "❌ | No hay ninguna canción reproduciéndose.")
                        .setColor(player.paused ? "Yellow" : "Red"),
                    ephemeral: true,
                }), 15000);

            await player.pause();
            logger.info(`[/pause] ${inter.user.username} pausó la reproducción en ${inter.guild.name}`);

            deleteAfterTimer(await replyEmbed({
                interaction: inter,
                embed: EmptyEmbed()
                    .setAuthor({ name: "⏸️ | Pausa", iconURL: inter.user.displayAvatarURL() })
                    .setDescription("La canción actual fue pausada. Usa /resume para continuar.")
                    .setColor("Green")
            }), 5000);
        })
