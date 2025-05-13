import { Player } from "lavalink-client/dist/types";
import { BotClient } from "../../class/BotClient.js";
import logger from "../../class/logger.js";
import { BaseLavalinkManagerEvents } from "../../class/events/BaseLavalinkManagerEvents.js";

export default class Destroy extends BaseLavalinkManagerEvents<"playerDestroy"> {
    name: "playerDestroy" = "playerDestroy";
    execute(client: BotClient, player: Player, destroyReason?: string | undefined): void {
        logger.info(`Se elimino un player "${client.getGuild(player.guildId)!.name}" razon: ${destroyReason}`)

        client.playerMessage.MessageContainer.delete(player.guildId)
        logger.info(`Se elimino el registro [playerMessage] de ${client.getGuild(player.guildId)!.name}`)
    }



}