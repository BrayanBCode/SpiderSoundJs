import { Client } from "discord.js";
import { DEvent } from "../../classes/events/DEvent.js"
import logger from "../../client/logger.js";
import { BClient } from "../../client/BClient.js";
import { registerSlashCommands } from "../../handler/command/slashCommandHandler.js";

export default class Ready extends DEvent<'clientReady'> {
    constructor() {
        super('clientReady', { once: true });
    }

    execute(BClient: BClient, client: Client<true>): Promise<void> | void {
        logger.info(`Bot ${client.user.displayName} Online`);

        BClient.music.init(process.env.botClientID as string);

        registerSlashCommands(BClient);

        logger.info(`Comandos Slash Registrados`);

    }

}