import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { config } from "@/config/config.js";
import { BaseNodeManagerEvents } from "@/structures/events/BaseNodeManagerEvents.js";
import { stringPathToSegmentedString } from "@/utils/tools.js";
import { readdirSync } from "fs";
import { NodeManagerEvents } from "lavalink-client";
import { join } from "path";


export async function registerLavalinkNodeEvents(client: BotClient): Promise<void> {
    const eventsPath: string = join(process.cwd(), ...stringPathToSegmentedString(config.handlersFolders.lavalink.node));
    const files = readdirSync(eventsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of files) {
        const filePath = join(eventsPath, file);

        try {
            const { default: EventClass } = await import(filePath) as {
                default: new () => BaseNodeManagerEvents<keyof NodeManagerEvents>;
            };

            // Validar que la clase importada extienda BaseLavalinkManagerEvents
            if (!EventClass || !(Object.getPrototypeOf(EventClass.prototype).constructor === BaseNodeManagerEvents)) {
                logger.warn(`El archivo ${file} no exporta una clase válida.`);
                continue;
            }

            const eventInstance = new EventClass();

            if (eventInstance.once) {
                client.manager.nodeManager.once(eventInstance.name, (...args: Parameters<NodeManagerEvents[typeof eventInstance.name]>) => {
                    eventInstance.execute(client, ...args);
                });
            } else {
                client.manager.nodeManager.on(eventInstance.name, (...args: Parameters<NodeManagerEvents[typeof eventInstance.name]>) => {
                    eventInstance.execute(client, ...args);
                });
            }

            logger.info(`|| Evento **${eventInstance.name}** registrado. ||`);
        } catch (error) {
            logger.error(`No se pudo registrar el evento en ${file}:`, error);
        }
    }
}
