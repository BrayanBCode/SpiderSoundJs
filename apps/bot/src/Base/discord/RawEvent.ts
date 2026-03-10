import type MusicClient from "@/client/MusicClient";
import type { ClientEvents } from "discord.js";

export abstract class RawEvent<K extends keyof ClientEvents> {
    public readonly name: K;
    public readonly once: boolean;

    constructor(name: K, once = false) {
        this.name = name;
        this.once = once;
    }

    abstract execute(bot: MusicClient, ...args: ClientEvents[K]): Promise<void> | void;

}