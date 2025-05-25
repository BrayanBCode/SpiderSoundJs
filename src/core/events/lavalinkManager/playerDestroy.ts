import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { BaseLavalinkManagerEvents } from "@/structures/events/BaseLavalinkManagerEvents.js";
import { Player } from "lavalink-client";


export default class Destroy extends BaseLavalinkManagerEvents<"playerDestroy"> {
    name: "playerDestroy" = "playerDestroy";
    execute(client: BotClient, player: Player, destroyReason?: string | undefined): void {
        logger.info(`Se elimino un player "${client.getGuild(player.guildId)!.name}" razon: ${destroyReason}`)

        client.playerMessage.MessageContainer.delete(player.guildId)
        logger.info(`Se elimino el registro [playerMessage] de ${client.getGuild(player.guildId)!.name}`)
    }



}