import { Player, Track, UnresolvedTrack, TrackEndEvent, TrackStuckEvent, TrackExceptionEvent } from "lavalink-client/dist/types";
import { BotClient } from "../../class/BotClient.js";
import { BaseLavalinkManagerEvents } from "../../class/events/BaseLavalinkManagerEvents.js";
import logger from "../../class/logger.js";
import { createEmptyEmbed, deleteAfterTimer } from "../../utils/tools.js";

export default class queueEnd extends BaseLavalinkManagerEvents<"queueEnd"> {
    name: "queueEnd" = "queueEnd";

    async execute(client: BotClient, player: Player, track: Track | UnresolvedTrack | null, payload: TrackEndEvent | TrackStuckEvent | TrackExceptionEvent): Promise<void> {
        const channel = client.playerMessage.MessageContainer.get(player.guildId)?.channel

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



        await client.playerMessage.delete(player.guildId)
        deleteAfterTimer(emptyMsg, 10000)
    }

}
