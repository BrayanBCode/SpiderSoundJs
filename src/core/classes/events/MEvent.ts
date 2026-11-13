import type { IManagerEvents as IEvents } from "moonlink.js/dist/src/typings/Interfaces.js";
import { BClient } from "../../client/BClient.js";


export abstract class MEvent<K extends keyof IEvents> {
    public readonly name: K;
    public readonly once: boolean;

    constructor(name: K, options?: { once?: boolean }) {
        this.name = name;
        this.once = options?.once ?? false;

    }

    abstract execute(client: BClient, ...args: Parameters<IEvents[K]>): Promise<void> | void;
}