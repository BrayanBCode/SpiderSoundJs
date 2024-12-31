import { LavalinkManagerEvents } from "lavalink-client/dist/types";
import { BotClient } from "../BotClient";

export abstract class BaseLavalinkManagerEvents<K extends keyof LavalinkManagerEvents> {
    eventType: String = "LavalinkManagerEvents"
    abstract name: K;
    once: boolean = false;

    abstract execute(client: BotClient, ...args: Parameters<LavalinkManagerEvents[K]>): void;
}
