import type MusicClient from "@/client/MusicClient";
import logger from "@/utils/logger";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { RawEvent } from "../Base/discord/RawEvent";


export function eventHandler(client: MusicClient, subDirPath?: string) {
    const eventsPath = subDirPath ? join(__dirname, "../../events/discord", subDirPath) : join(__dirname, "../../events/discord");

    const files = readdirSync(eventsPath, { withFileTypes: true });

    logger.info(`🔄 Cargando eventos desde: ${eventsPath}`);
    logger.info(`📂 Encontrados ${files.length} archivos de eventos.`);

    for (const file of files) {
        if (file.isDirectory()) {

            eventHandler(client, file.name);

            continue
        }


        if (!file.name.endsWith(".ts") && !file.name.endsWith(".js")) continue;

        const imported = require(join(eventsPath, file.name));

        const EventClass = imported.default;

        const event = new EventClass() as RawEvent<any>;

        if (event.once) {
            client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }

        logger.info(`Evento cargado: ${event.name}`);

    }

}