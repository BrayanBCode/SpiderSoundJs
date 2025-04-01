import { Player, Track, UnresolvedTrack, TrackExceptionEvent, WebSocketClosedEvent } from "lavalink-client/dist/types";
import { BotClient } from "../../class/BotClient.js";
import { BaseLavalinkManagerEvents } from "../../class/events/BaseLavalinkManagerEvents.js";
import logger from "../../class/logger.js";

export default class trackError extends BaseLavalinkManagerEvents<"playerSocketClosed"> {
    name: "playerSocketClosed" = "playerSocketClosed";
    execute(client: BotClient, player: Player, payload: WebSocketClosedEvent): void {
        logger.warn("Player de ", client.getGuild(player.guildId).name)
        logger.warn(payload)
    }


}