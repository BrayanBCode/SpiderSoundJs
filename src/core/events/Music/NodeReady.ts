import { EmbedBuilder } from "discord.js";
import { Node as INode } from "moonlink.js";
import { BClient } from "../../client/BClient.js";
import { notifyDev } from "../../client/devNotifier.js";
import { MEvent } from "../../classes/events/MEvent.js";
import logger from "../../client/logger.js";

/** Nodos que tuvieron un error: al volver se avisa que se recuperaron */
const failedNodes = new Set<string>();
export const markNodeError = (identifier: string) => failedNodes.add(identifier);

export default class NReady extends MEvent<"nodeReady"> {
    constructor() {
        super("nodeReady");
    }
    execute(client: BClient, node: INode): Promise<void> | void {
        logger.debug(`Node ready: ${node.identifier}`);
        if (!failedNodes.delete(node.identifier)) return;

        logger.info(`[Lavalink] El nodo ${node.identifier} volvió después de un error`);
        notifyDev(new EmbedBuilder()
            .setTitle("🟢 Lavalink volvió")
            .setColor("Green")
            .setDescription(`El nodo **${node.identifier}** está conectado de nuevo.`));
    }
}
