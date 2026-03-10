import type MusicClient from "@/client/MusicClient";
import { MRawEvent } from "@/src/Base/moonlink/MRawEvents";
import logger from "@/utils/logger";
import type { Player, Track } from "moonlink.js";

export default class TrackEndEvent extends MRawEvent<"trackEnd"> {
    constructor() {
        super("trackEnd");
    }

    override execute(client: MusicClient, player: Player, track: Track): Promise<void> | void {
        logger.info(`🎶 Reproducción finalizada: ${track.title} en el servidor ${player.guildId}`);
    }
}