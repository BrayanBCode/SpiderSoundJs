import { Player } from "lavalink-client/dist/types";
import { BotClient } from "../../class/BotClient.js";
import logger from "../../class/logger.js";
import { BaseLavalinkManagerEvents } from "../../class/events/BaseLavalinkManagerEvents.js";

export default class PlayerCreate extends BaseLavalinkManagerEvents<"playerCreate"> {
    name: "playerCreate" = "playerCreate";
    execute(client: BotClient, player: Player): void {
        logger.info(`Se creo un player para "${client.getGuild(player.guildId)!.name}"`)
    }


}