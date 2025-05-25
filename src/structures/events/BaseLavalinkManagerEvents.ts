import { BotClient } from "@/bot/BotClient.js";
import { LavalinkManagerEvents } from "lavalink-client";


export abstract class BaseLavalinkManagerEvents<K extends keyof LavalinkManagerEvents> {
    eventType: String = "LavalinkManagerEvents"
    abstract name: K;
    once: boolean = false;

    abstract execute(client: BotClient, ...args: Parameters<LavalinkManagerEvents[K]>): void;
}
