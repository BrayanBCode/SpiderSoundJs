import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { BaseLavalinkManagerEvents } from "@/structures/events/BaseLavalinkManagerEvents.js";
import { createEmptyEmbed, deleteAfterTimer } from "@/utils/tools.js";
import { Player, Track, UnresolvedTrack, TrackEndEvent, TrackStuckEvent, TrackExceptionEvent } from "lavalink-client";


export default class queueEnd extends BaseLavalinkManagerEvents<"queueEnd"> {
    name: "queueEnd" = "queueEnd";

    async execute(client: BotClient, player: Player, track: Track | UnresolvedTrack | null, payload: TrackEndEvent | TrackStuckEvent | TrackExceptionEvent): Promise<void> {
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
