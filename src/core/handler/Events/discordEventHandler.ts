import { readdirSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import { BClient } from "../../client/BClient.js";
import { DEvent } from "../../classes/events/DEvent.js";
import logger from "../../client/logger.js";
import path from "node:path";


const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadDiscordEvents(client: BClient) {
    const eventsPath = path.join(__dirname, "../../events/Bot");
    const files = readdirSync(eventsPath).filter(f => f.endsWith(".js"));

    for (const file of files) {
        const { default: EventClass } = await import(
            pathToFileURL(path.join(eventsPath, file)).href
        );

        const event: DEvent<any> = new EventClass();

        if (event.once) {
            client.once(event.name, (...args) => runEvent(event, client, args));
        } else {
            client.on(event.name, (...args) => runEvent(event, client, args));
        }

        logger.info(`[Discord] Evento cargado: ${event.name}`);
    }
}

/** Ejecuta el evento capturando sus errores: un fallo en un evento no debe tumbar el bot */
function runEvent(event: { name: string, execute: (...args: any[]) => unknown }, client: BClient, args: unknown[]) {
    try {
        Promise.resolve(event.execute(client, ...args)).catch(err =>
            logger.error(`[Discord] Error en el evento ${event.name}:`, err));
    } catch (err) {
        logger.error(`[Discord] Error en el evento ${event.name}:`, err);
    }
}
