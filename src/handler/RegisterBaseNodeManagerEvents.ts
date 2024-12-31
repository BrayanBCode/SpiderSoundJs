import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { BotClient } from '../class/BotClient.js';
import { NodeManagerEvents } from 'lavalink-client/dist/types';
import { BaseNodeManagerEvents } from '../class/events/BaseNodeManagerEvents.js';
import logger from '../class/logger.js';

export async function registerLavalinkNodeEvents(client: BotClient): Promise<void> {
    const eventsPath: string = join(process.cwd(), "dist", "Events", "lavalinkNodeManager");
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
                client.lavaManager.nodeManager.once(eventInstance.name, (...args: Parameters<NodeManagerEvents[typeof eventInstance.name]>) => {
                    eventInstance.execute(client, ...args);
                });
            } else {
                client.lavaManager.nodeManager.on(eventInstance.name, (...args: Parameters<NodeManagerEvents[typeof eventInstance.name]>) => {
                    eventInstance.execute(client, ...args);
                });
            }

            logger.info(`Evento ${eventInstance.name} registrado correctamente.`);
        } catch (error) {
            logger.error(`No se pudo registrar el evento en ${file}:`, error);
        }
    }
}
