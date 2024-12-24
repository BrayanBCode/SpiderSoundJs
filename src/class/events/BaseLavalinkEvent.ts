import { LavalinkManagerEvents, NodeManagerEvents } from "lavalink-client/dist/types";

// Base para eventos de Lavalink
export abstract class BaseLavalinkEvent<K extends keyof (NodeManagerEvents & LavalinkManagerEvents)> {
    abstract name: K;
    abstract once: boolean;
    abstract execute(...args: any[]): void;
}