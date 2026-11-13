import { Player } from "moonlink.js";
import { BClient } from "../../client/BClient.js";
import { MEvent } from "../../classes/events/MEvent.js";
import logger from "../../client/logger.js";

export default class PCreate extends MEvent<"playerCreate"> {
    constructor() {
        super("playerCreate");
    }
    execute(client: BClient, player: Player): Promise<void> | void {
        logger.debug(`Player created in guild ${player.guildId} on node ${player.node.identifier}`);
    }

}