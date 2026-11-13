import { ClientEvents } from "discord.js";
import { BClient } from "../../client/BClient.js";


export abstract class DEvent<K extends keyof ClientEvents> {
    public readonly name: K;
    public readonly once: boolean;

    constructor(name: K, options?: { once?: boolean }) {
        this.name = name;
        this.once = options?.once ?? false;

    }

    abstract execute(BClient: BClient, ...args: ClientEvents[K]): Promise<void> | void;
}