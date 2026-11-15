import { EmbedBuilder } from "discord.js";
import { Node as INode } from "moonlink.js";
import { BClient } from "../../client/BClient.js";
import { notifyDev } from "../../client/devNotifier.js";
import { MEvent } from "../../classes/events/MEvent.js";
import logger from "../../client/logger.js";
import { markNodeError } from "./NodeReady.js";

export default class NError extends MEvent<"nodeError"> {
    execute(client: BClient, node: INode, error: Error): Promise<void> | void {
        logger.error(`Node error: ${node.identifier}`, error);
        markNodeError(node.identifier);
        // Mientras Lavalink está caído reintenta seguido: un aviso por minuto alcanza
        notifyDev(new EmbedBuilder()
            .setTitle("🔴 Error en Lavalink")
            .setColor("Red")
            .setDescription(`Nodo **${node.identifier}**: ${String(error?.message ?? error).slice(0, 1000)}\nLa música puede no sonar hasta que vuelva.`),
            `node-error-${node.identifier}`);
    }
    constructor() {
        super("nodeError");
    }
}
