import { readdirSync } from "fs";
import { join } from "path";
import { BotClient } from "../class/BotClient.js";
import { BaseDiscordEvent } from "../class/events/BaseDiscordEvent.js";
import { ClientEvents } from "discord.js";
import logger from "../class/logger.js";


export async function registerDiscordEvents(client: BotClient): Promise<void> {

    const eventsPath: string = join(process.cwd(), "dist", "Events", "discord")
    const files = readdirSync(eventsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of files) {
        const filePath = join(eventsPath, file);

        try {
            // Importar dinámicamente la clase del evento
            const { default: EventClass } = await import(filePath) as { default: new () => BaseDiscordEvent<keyof ClientEvents> };

            if (!EventClass || !(Object.getPrototypeOf(EventClass.prototype).constructor === BaseDiscordEvent)) {
                logger.warn(`El archivo ${file} no exporta una clase válida.`);
                continue;
            }

            const eventInstance = new EventClass();

            if (eventInstance.once) {
                client.once(eventInstance.name, (...args) => {
                    eventInstance.execute(client, ...args)
                });
            } else {
                client.on(eventInstance.name, (...args) => {
                    eventInstance.execute(client, ...args)
                });
            }

            logger.info(`|| Evento **${eventInstance.name}** registrado. ||`);

        } catch (error) {
            logger.error(`No se pudo registrar el evento en ${file}:`, error);
        }
    }
}
