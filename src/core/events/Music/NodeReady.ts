import { Node as INode } from "moonlink.js";
import { BClient } from "../../client/BClient.js";
import { MEvent } from "../../classes/events/MEvent.js";
import logger from "../../client/logger.js";

export default class NReady extends MEvent<"nodeReady"> {
    constructor() {
        super("nodeReady");
    }
    execute(client: BClient, node: INode): Promise<void> | void {
        logger.debug(`Node ready: ${node.identifier}`);
    }


}