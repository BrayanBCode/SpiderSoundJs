import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { BaseNodeManagerEvents } from "@/structures/events/BaseNodeManagerEvents.js";
import { LavalinkNode } from "lavalink-client";


export default class Connect extends BaseNodeManagerEvents<"connect"> {
    name: "connect" = "connect";
    execute(client: BotClient, node: LavalinkNode): void {
        logger.info(`Se establecio conexion con el nodo: ${node.id}`)
    }

}