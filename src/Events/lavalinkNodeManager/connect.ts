import { LavalinkNode } from "lavalink-client/dist/types";
import { BotClient } from "../../class/BotClient.js";
import { BaseNodeManagerEvents } from "../../class/events/BaseNodeManagerEvents.js";
import logger from "../../class/logger.js";

export default class Connect extends BaseNodeManagerEvents<"connect"> {
    name: "connect" = "connect";
    execute(client: BotClient, node: LavalinkNode): void {
        logger.info(`Se establecio conexion con el nodo: ${node.id}`)
    }

}