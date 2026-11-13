import { Node as INode } from "moonlink.js";
import { BClient } from "../../client/BClient.js";
import { MEvent } from "../../classes/events/MEvent.js";
import logger from "../../client/logger.js";

export default class NCreate extends MEvent<"nodeCreate"> {
    constructor() {
        super("nodeCreate");
    }
    execute(client: BClient, node: INode): Promise<void> | void {
        logger.debug(`Node created: ${node.identifier}`);
    }


}