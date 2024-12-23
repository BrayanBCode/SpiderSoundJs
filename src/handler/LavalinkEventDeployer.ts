import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "url";
import { BotClient } from "../class/BotClient";

/**
 * Carga y registra un evento desde un archivo específico.
 * @param client - Instancia del cliente del bot
 * @param eventPath - Ruta al archivo del evento
 */
async function loadLavalinkEvent(client: BotClient, eventPath: string) {
    const fileUrl = pathToFileURL(eventPath).href;

    try {
        // Importa el evento dinámicamente
        const event = await import(fileUrl).then((mod) => mod.default);
        if (!event || !event.name || !event.execute) {
            console.warn(`[WARNING] El archivo ${eventPath} no tiene las propiedades "name" o "execute".`);
            return;
        }

        // Registra el evento en el cliente
        if (event.once) {
            client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }

        console.log(`Evento cargado: ${event.name}`);
    } catch (err) {
        console.error(`[ERROR] Falló la carga del evento en ${eventPath}:`, err);
    }
}

/**
 * Carga todos los eventos desde una carpeta.
 * @param client - Instancia del cliente del bot
 * @param eventsDir - Directorio donde están los archivos de eventos
 */
export async function loadAllLavalinkEvents(client: BotClient, eventsDir: string) {
    const files = readdirSync(eventsDir).filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

    console.log(`Obteniendo eventos de ${eventsDir}`);
    for (const file of files) {
        const filePath = join(eventsDir, file);
        await loadLavalinkEvent(client, filePath);
    }
}

/**
 * Carga los eventos de subcarpetas si existen.
 * @param client - Instancia del cliente del bot
 * @param baseDir - Carpeta base de eventos
 */
export async function loadLavalinkEvents(client: BotClient, baseDir: string) {
    const folders = readdirSync(baseDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());

    for (const folder of folders) {
        const folderPath = join(baseDir, folder.name);
        await loadAllLavalinkEvents(client, folderPath);
    }

    // Finalmente, carga los eventos directamente en la carpeta base
    await loadAllLavalinkEvents(client, baseDir);
}
