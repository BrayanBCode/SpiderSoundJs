import { NodeManagerEvents } from "lavalink-client/dist/types";
import { BotClient } from "../BotClient";

export abstract class BaseNodeManagerEvents<K extends keyof NodeManagerEvents> {
    eventType: string = "NodeManagerEvents"
    abstract name: K;
    once: boolean = false;

    abstract execute(client: BotClient, ...args: Parameters<NodeManagerEvents[K]>): void;
}
