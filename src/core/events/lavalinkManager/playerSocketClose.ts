import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { BaseLavalinkManagerEvents } from "@/structures/events/BaseLavalinkManagerEvents.js";
import { Player, WebSocketClosedEvent } from "lavalink-client";


export default class trackError extends BaseLavalinkManagerEvents<"playerSocketClosed"> {
    name: "playerSocketClosed" = "playerSocketClosed";
    execute(client: BotClient, player: Player, payload: WebSocketClosedEvent): void {
        logger.warn("player Socket Closed", client.getGuild(player.guildId)?.name)
        logger.warn(payload)
    }


}