import type MusicClient from "@/client/MusicClient";
import { MRawEvent } from "@/src/Base/moonlink/MRawEvents";
import logger from "@/utils/logger";
import type { Player, Track } from "moonlink.js";

export default class TrackStartEvent extends MRawEvent<"trackStart"> {
    constructor() {
        super("trackStart");
    }

    override execute(client: MusicClient, player: Player, track: Track): Promise<void> | void {
        logger.info(`🎶 Reproduciendo: ${track.title} en el servidor ${player.guildId}`);
    }
}