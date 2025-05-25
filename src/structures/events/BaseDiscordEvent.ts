import { BotClient } from "@/bot/BotClient.js";
import { ClientEvents } from "discord.js";


export abstract class BaseDiscordEvent<K extends keyof ClientEvents> {
    abstract name: K;
    once: boolean = false;

    abstract execute(client: BotClient, ...args: ClientEvents[K]): void | Promise<void>;
}
