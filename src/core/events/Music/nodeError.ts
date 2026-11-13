import { Node as INode } from "moonlink.js";
import { BClient } from "../../client/BClient.js";
import { MEvent } from "../../classes/events/MEvent.js";
import logger from "../../client/logger.js";

export default class NError extends MEvent<"nodeError"> {
    execute(client: BClient, node: INode, error: Error): Promise<void> | void {
        logger.error(`Node error: ${node.identifier}`, error);
    }
    constructor() {
        super("nodeError");
    }



}