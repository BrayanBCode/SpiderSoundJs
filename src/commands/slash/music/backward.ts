import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import { EmptyEmbed } from "../../../utils/messages.js";
import { requireListener, seekRelative } from "../../../core/music/player.js";
import logger from "../../../core/client/logger.js";

export default new SlashCommand()
    .setName("backward")
    .setDescription("Retrocede la canción actual en una cantidad específica de segundos.")
    .setCategory("Music")

    .setExecute(
        async (client, inter) => {
            const seconds = inter.options.getInteger("seconds") ?? 10;
            const player = await requireListener(client, inter);
            if (!player) return;

            if (!player.playing || !player.current)
                return inter.reply({
                    embeds: [
                        EmptyEmbed()
                            .setDescription("❌ | No hay ninguna canción reproduciéndose actualmente.")
                            .setColor("Red")
                    ],

                });

            await seekRelative(player, -seconds * 1_000);
            logger.info(`[/backward] ${inter.user.username} movió la canción -${seconds}s en ${inter.guild.name}`);
            return inter.reply({
                embeds: [
                    EmptyEmbed()
                        .setDescription(`✅ | Retrocedido la canción ${seconds} segundos.`)
                        .setColor("Green")
                ]
            });
        }
    )

    .addIntegerOption(option =>
        option
            .setName("seconds")
            .setDescription("Número de segundos para retroceder (predeterminado: 10 segundos).")
            .setMinValue(1)
            .setMaxValue(600)
            .setRequired(false)
    )
