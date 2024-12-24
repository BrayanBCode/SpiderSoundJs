import { ClientEvents } from "discord.js";
import { BotClient } from "../BotClient.js";

export abstract class BaseDiscordEvent<K extends keyof ClientEvents> {
    abstract name: K;
    once: boolean = false;

    // Método abstracto para ser implementado en las subclases
    abstract execute(client: BotClient, ...args: ClientEvents[K]): void | Promise<void>;
}
