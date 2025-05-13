import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { BotClient } from '../class/BotClient.js';
import { LavalinkManagerEvents } from 'lavalink-client/dist/types';
import { BaseLavalinkManagerEvents } from '../class/events/BaseLavalinkManagerEvents.js';
import logger from '../class/logger.js';

export async function registerLavalinkEvents(client: BotClient): Promise<void> {
    const eventsPath: string = join(process.cwd(), "dist", "Events", "lavalinkManager");
    const files = readdirSync(eventsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

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
                client.lavaManager.once(eventInstance.name, (...args: Parameters<LavalinkManagerEvents[typeof eventInstance.name]>) => {
                    eventInstance.execute(client, ...args);
                });
            } else {
                client.lavaManager.on(eventInstance.name, (...args: Parameters<LavalinkManagerEvents[typeof eventInstance.name]>) => {
                    eventInstance.execute(client, ...args);
                });
            }

            logger.info(`|| Evento **${eventInstance.name}** registrado. ||`);
        } catch (error) {
            logger.error(`No se pudo registrar el evento en ${file}:`, error);
        }
    }
}
