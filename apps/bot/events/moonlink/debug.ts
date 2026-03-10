import type MusicClient from "@/client/MusicClient";
import { MRawEvent } from "@/src/Base/moonlink/MRawEvents";
import logger from "@/utils/logger";
import type { Player, Track } from "moonlink.js";

export default class TrackStartEvent extends MRawEvent<"debug"> {
    constructor() {
        super("debug");
    }

    override execute(client: MusicClient, message: string): Promise<void> | void {
        // logger.debug(`Moonlink Debug:`);
        // logger.debug(message);
    }

}