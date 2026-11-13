import { Player, Track } from "moonlink.js";
import { BClient } from "../../client/BClient.js";
import { MEvent } from "../../classes/events/MEvent.js";
import logger from "../../client/logger.js";
import { GuildMember, MessageFlags, TextChannel } from "discord.js";
import { EmptyEmbed } from "../../../utils/messages.js";
import { formatMS_HHMMSS, titleCleaner } from "../../../utils/tools.js";

export default class TEnd extends MEvent<"trackEnd"> {
    constructor() {
        super("trackEnd");
    }
    async execute(client: BClient, player: Player, track: Track) {
        logger.info(`Track ended: ${track.title} in guild ${player.guildId}`);
    }

}