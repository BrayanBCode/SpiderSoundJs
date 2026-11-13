import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import { deleteAfterTimer, EmptyEmbed, replyEmbed } from "../../../utils/messages.js";
import { requireListener } from "../../../core/music/player.js";
import logger from "../../../core/client/logger.js";

export default new SlashCommand()
    .setName("resume")
    .setDescription("Reanuda la canción pausada.")
    .setCategory("Music")
    .setExecute(
        async (client, inter) => {
            const player = await requireListener(client, inter);
            if (!player) return;

            if (!player.current || !player.paused)
                return deleteAfterTimer(await replyEmbed({
                    interaction: inter,
                    embed: EmptyEmbed()
                        .setDescription(player.current
                            ? "▶️ | La reproducción no está en pausa."
                            : "❌ | No hay ninguna canción reproduciéndose.")
                        .setColor(player.current ? "Yellow" : "Red"),
                    ephemeral: true,
                }), 15000);

            await player.resume();
            logger.info(`[/resume] ${inter.user.username} reanudó la reproducción en ${inter.guild.name}`);

            deleteAfterTimer(await replyEmbed({
                interaction: inter,
                embed: EmptyEmbed()
                    .setAuthor({ name: "▶️ | Reanudar", iconURL: inter.user.displayAvatarURL() })
                    .setDescription("La reproducción continúa.")
                    .setColor("Green")
            }), 5000);
        })
