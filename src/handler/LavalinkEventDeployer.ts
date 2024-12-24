import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { BotClient } from '../class/BotClient';
import { LavalinkManagerEvents } from 'lavalink-client/dist/types';
import { BaseLavalinkEvent } from '../class/events/BaseLavalinkEvent';

export async function loadLavalinkEvents(client: BotClient) {
    const eventsPath = join(process.cwd(), 'dist', 'events', 'lavalink');
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of eventFiles) {
        const { default: EventClass } = await import(join(eventsPath, file)) as { default: new () => BaseLavalinkEvent<keyof (LavalinkManagerEvents & LavalinkManagerEvents)> };
        const eventInstance = new EventClass();

        if (eventInstance.name in client.lavaManager.eventNames) {
            if (eventInstance.once) {
                client.lavaManager.once(eventInstance.name as keyof LavalinkManagerEvents, (...args: any) =>
                    eventInstance.execute(client, ...args)
                );
            } else {
                client.lavaManager.on(eventInstance.name as keyof LavalinkManagerEvents, (...args: any) =>
                    eventInstance.execute(client, ...args)
                );
            }
        } else {
            console.error(`El evento ${eventInstance.name} no es válido para LavalinkManager.`);
        }


        console.log(`|| Cargado evento Lavalink: ${eventInstance.name} ||`);
    }
}
