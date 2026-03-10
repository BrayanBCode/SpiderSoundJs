import type MusicClient from "@/client/MusicClient";
import { MRawEvent } from "@/src/Base/moonlink/MRawEvents";
import type { INode } from "moonlink.js/dist/src/typings/Interfaces";

export default class Raw extends MRawEvent<"nodeRaw"> {
    constructor() {
        super("nodeRaw");
    }
    execute(client: MusicClient, node: INode, payload: any): Promise<void> | void {
        client.music.packetUpdate(payload);
        // logger.debug(`Raw event received from node ${node.id}: ${JSON.stringify(payload)}`);
    }
}