import { BotClient } from "@/bot/BotClient.js";
import { NodeManagerEvents } from "lavalink-client";


export abstract class BaseNodeManagerEvents<K extends keyof NodeManagerEvents> {
    eventType: string = "NodeManagerEvents"
    abstract name: K;
    once: boolean = false;

    abstract execute(client: BotClient, ...args: Parameters<NodeManagerEvents[K]>): void;
}
