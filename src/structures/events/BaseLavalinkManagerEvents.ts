import { BotClient } from "@/bot/BotClient.js";
import { IEvents } from "moonlink.js";


export abstract class BaseMoonLinkManagerEvents<K extends keyof IEvents> {
    eventType: string = "MoonLinkManagerEvents"
    abstract name: K;
    once: boolean = false;

    abstract execute(client: BotClient, ...args: Parameters<IEvents[K]>): void;
}
