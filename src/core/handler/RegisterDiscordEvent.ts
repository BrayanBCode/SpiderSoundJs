import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { config } from "@/config/config.js";
import { BaseDiscordEvent } from "@/structures/events/BaseDiscordEvent.js";
import { stringPathToSegmentedString } from "@/utils/tools.js";
import { ClientEvents } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";


export async function registerDiscordEvents(client: BotClient): Promise<void> {

    const eventsPath: string = join(process.cwd(), ...stringPathToSegmentedString(config.handlersFolders.discord.events))
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
