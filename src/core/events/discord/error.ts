import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { BaseDiscordEvent } from "@/structures/events/BaseDiscordEvent.js";


export default class errorCatcher extends BaseDiscordEvent<"error"> {
    name: "error" = "error";
    execute(client: BotClient, error: Error): void | Promise<void> {
        logger.error(`Ocurrio un error ${error.name}`)

        if (error.message) {
            logger.error(`Mensaje del error: ${error.message}`);
        }
        if (error.stack) {
            logger.error(`Traceback del error: \n${error.stack}`);
        }
    }

}