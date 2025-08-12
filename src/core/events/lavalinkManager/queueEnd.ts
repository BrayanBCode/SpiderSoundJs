import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { BaseMoonLinkManagerEvents } from "@/structures/events/BaseLavalinkManagerEvents.js";
import { sendReply } from "@/utils/replyUtils.js";
import { createEmptyEmbed, deleteAfterTimer } from "@/utils/tools.js";
import { Player } from "moonlink.js";

export default class queueEnd extends BaseMoonLinkManagerEvents<"queueEnd"> {
    name: "queueEnd" = "queueEnd";
    once: boolean = false;
    async execute(client: BotClient, player: Player, track?: any): Promise<void> {
        const channel = client.playerMessage.getData(player.guildId)?.channel

        if (!channel) {
            logger.error(`[queueEnd] No se encontro el canal de texto`)
            return
        }


        const emptyMsg = await channel.send({
            embeds: [
                createEmptyEmbed()
                    .setAuthor({ name: "Lista de reproducción vacia" })
                    .setDescription(`Utiliza el comando /play para seguir escuchando.`)
            ]
        })

        setTimeout(() => {
            const gettedPlayer = client.getPlayer(player.guildId);
            if (gettedPlayer && gettedPlayer.queue.tracks.length === 0) {
                gettedPlayer.disconnect()
            }
        }, 15000)


        await client.playerMessage.delete(player.guildId)
        deleteAfterTimer(emptyMsg, 10000)
    }

}


