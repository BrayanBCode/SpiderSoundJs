import { readdirSync } from "fs";
import { join } from "path";
import { BotClient } from "../class/BotClient.js";
import { BaseDiscordEvent } from "../class/DiscordEvent.js";


export async function registerDiscordEvents(client: BotClient, eventsPath: string): Promise<void> {
    const files = readdirSync(eventsPath).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of files) {
        const filePath = join(eventsPath, file);

        try {
            // Importar dinámicamente la clase del evento
            const { default: EventClass } = await import(filePath) as { default: new () => BaseDiscordEvent };

            // Validar que la clase importada extienda BaseDiscordEvent
            if (!EventClass || !(Object.getPrototypeOf(EventClass.prototype).constructor === BaseDiscordEvent)) {
                console.warn(`[WARNING] El archivo ${file} no exporta una clase válida.`);
                continue;
            }

            // Crear instancia del evento
            const eventInstance = new EventClass();

            // Registrar el evento en el cliente
            if (eventInstance.once) {
                client.once(eventInstance.name, (...args) => eventInstance.execute(client, ...args));
            } else {
                client.on(eventInstance.name, (...args) => eventInstance.execute(client, ...args));
            }

            console.log(`[INFO] Evento ${eventInstance.name} registrado correctamente.`);
        } catch (error) {
            console.error(`[ERROR] No se pudo registrar el evento en ${file}:`, error);
        }
    }
}
