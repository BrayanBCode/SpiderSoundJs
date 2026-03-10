import type MusicClient from "@/client/MusicClient";
import type { IManagerEvents } from "moonlink.js/dist/src/typings/Interfaces";


export abstract class MRawEvent<K extends keyof IManagerEvents> {
    public readonly name: K;
    public readonly once: boolean;

    constructor(name: K, options?: { once?: boolean }) {
        this.name = name;
        this.once = options?.once ?? false;

    }

    abstract execute(client: MusicClient, ...args: Parameters<IManagerEvents[K]>): Promise<void> | void;
}