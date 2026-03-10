import type MusicClient from "@/client/MusicClient";
import logger from "@/utils/logger";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { RawEvent } from "../Base/discord/RawEvent";
import type { IManagerEvents } from "moonlink.js/dist/src/typings/Interfaces";
import type { MRawEvent } from "../Base/moonlink/MRawEvents";


export function moonLinkEventHandler(client: MusicClient, subDirPath?: string) {
    const eventsPath = subDirPath ? join(__dirname, "../../events/moonlink", subDirPath) : join(__dirname, "../../events/moonlink");

    const files = readdirSync(eventsPath, { withFileTypes: true });

    logger.info(`🔄 Cargando eventos de moonlink desde: ${eventsPath}`);
    logger.info(`📂 Encontrados ${files.length} archivos de eventos.`);

    for (const file of files) {
        if (file.isDirectory()) {

            moonLinkEventHandler(client, file.name);

            continue
        }

        if (!file.name.endsWith(".ts") && !file.name.endsWith(".js")) continue;

        const imported = require(join(eventsPath, file.name));

        const EventClass = imported.default;

        const event = new EventClass() as MRawEvent<any>;


        if (event.once) {
            client.music.once(event.name, (...args: unknown[]) => event.execute(client, ...args));
        } else {
            client.music.on(event.name, (...args: unknown[]) => event.execute(client, ...args));
        }

        logger.info(`Evento de moonlink cargado: ${event.name}`);

    }

}