import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { config } from "@/config/config.js";
import { BaseLavalinkManagerEvents } from "@/structures/events/BaseLavalinkManagerEvents.js";
import { stringPathToSegmentedString } from "@/utils/tools.js";
import { readdirSync } from "fs";
import { LavalinkManagerEvents } from "lavalink-client";
import { join } from "path";


export async function registerLavalinkEvents(client: BotClient): Promise<void> {
    const eventsPath: string = join(process.cwd(), ...stringPathToSegmentedString(config.handlersFolders.lavalink.manager));
    // logger.debug(eventsPath)
    const files = readdirSync(eventsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
    // logger.debug(files)
    for (const file of files) {
        const filePath = join(eventsPath, file);

        try {
            const { default: EventClass } = await import(filePath) as {
                default: new () => BaseLavalinkManagerEvents<keyof LavalinkManagerEvents>;
            };

            // Validar que la clase importada extienda BaseLavalinkManagerEvents
            if (!EventClass || !(Object.getPrototypeOf(EventClass.prototype).constructor === BaseLavalinkManagerEvents)) {
                logger.warn(`El archivo ${file} no exporta una clase válida.`);
                continue;
            }

            const eventInstance = new EventClass();

            if (eventInstance.once) {
                client.manager.once(eventInstance.name, (...args: Parameters<LavalinkManagerEvents[typeof eventInstance.name]>) => {
                    eventInstance.execute(client, ...args);
                });
            } else {
                client.manager.on(eventInstance.name, (...args: Parameters<LavalinkManagerEvents[typeof eventInstance.name]>) => {
                    eventInstance.execute(client, ...args);
                });
            }

            logger.info(`|| Evento **${eventInstance.name}** registrado. ||`);
        } catch (error) {
            logger.error(`No se pudo registrar el evento en ${file}:`, error);
        }
    }
}
