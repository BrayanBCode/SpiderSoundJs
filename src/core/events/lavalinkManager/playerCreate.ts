import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { BaseLavalinkManagerEvents } from "@/structures/events/BaseLavalinkManagerEvents.js";
import { Player } from "lavalink-client";


export default class PlayerCreate extends BaseLavalinkManagerEvents<"playerCreate"> {
    name: "playerCreate" = "playerCreate";
    execute(client: BotClient, player: Player): void {
        logger.info(`Se creo un player para "${client.getGuild(player.guildId)!.name}"`)
    }


}