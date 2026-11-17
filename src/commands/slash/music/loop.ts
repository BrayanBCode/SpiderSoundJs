import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import { EmptyEmbed } from "../../../utils/messages.js";
import { requireListener } from "../../../core/music/player.js";
import { loopMessage, nextLoopMode } from "../../../core/music/timing.js";
import logger from "../../../core/client/logger.js";

export default new SlashCommand()
    .setName("loop")
    .setDescription("Repetición: OFF, canción o cola (sin elegir, pasa a la siguiente, como el botón).")
    .setCategory("Music")
    .setExecute(
        async (client, inter) => {
            const player = await requireListener(client, inter);
            if (!player) return;

            const mode = (inter.options.getString("modo") as "off" | "track" | "queue" | null) ?? nextLoopMode(player.loop);
            player.setLoop(mode);
            logger.info(`[/loop] ${inter.user.username} puso el loop en ${mode} en ${inter.guild.name}`);

            return inter.reply({ embeds: [EmptyEmbed().setDescription(loopMessage(mode)).setColor("Green")] });
        }
    )
    .addStringOption(o => o
        .setName("modo")
        .setDescription("Qué repetir.")
        .setRequired(false)
        .addChoices(
            { name: "OFF (no repetir)", value: "off" },
            { name: "Canción actual", value: "track" },
            { name: "Toda la cola", value: "queue" },
        ))
