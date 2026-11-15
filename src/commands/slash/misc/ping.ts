import { MessageFlags } from "discord.js";
import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import logger from "../../../core/client/logger.js";
import { EmptyEmbed } from "../../../utils/messages.js";

/** Verde, amarillo o rojo según los ms */
const color = (ms: number) => ms < 200 ? "Green" : ms < 500 ? "Yellow" : "Red";

export default new SlashCommand()
    .setName("ping")
    .setDescription("Muestra cuánto tarda el bot en responder (en ms).")
    .setCategory("Misc")
    .setExecute(async (client, inter) => {
        try {
            const { resource } = await inter.reply({ content: "🏓 Midiendo…", flags: MessageFlags.Ephemeral, withResponse: true });
            // Desde que el usuario mandó el comando hasta que llegó la respuesta del bot
            const roundtrip = (resource?.message?.createdTimestamp ?? Date.now()) - inter.createdTimestamp;
            // -1 mientras el shard todavía no midió su primer latido
            const gateway = client.ws.ping;

            logger.debug(`[/ping] ${inter.user.username}: respuesta ${roundtrip} ms, gateway ${gateway} ms`);
            return inter.editReply({
                content: "",
                embeds: [EmptyEmbed()
                    .setDescription(`🏓 **Pong!**\nRespuesta: **${roundtrip} ms**\nConexión con Discord: **${gateway >= 0 ? `${gateway} ms` : "midiendo…"}**`)
                    .setColor(color(Math.max(roundtrip, gateway)))],
            });
        } catch (err) {
            logger.error(`[/ping] Error no controlado en el comando:`, err);
        }
    })
