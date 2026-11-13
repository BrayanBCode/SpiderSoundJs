import { Player, Track } from "moonlink.js";
import { BClient } from "../../client/BClient.js";
import { MEvent } from "../../classes/events/MEvent.js";
import logger from "../../client/logger.js";
import { GuildMember, MessageFlags, TextChannel } from "discord.js";
import { EmptyEmbed } from "../../../utils/messages.js";
import { getRequesterInfo } from "../../music/player.js";
import { formatMS_HHMMSS, titleCleaner } from "../../../utils/tools.js";

export default class TStart extends MEvent<"trackStart"> {
    constructor() {
        super("trackStart");
    }
    async execute(client: BClient, player: Player, track: Track) {
        const guildName = client.getGuild(player.guildId)?.name ?? player.guildId;
        const requester = getRequesterInfo(track.requester).name;
        logger.info(`[TrackStart] Sonando "${track.title}" en ${guildName} (pedida por ${requester}, cola: ${player.queue.size})`);

        const textChannel = client.getTextChannel(player.textChannelId) as TextChannel;
        if (!textChannel) {
            logger.warn(`[TrackStart] No se encontró el canal de texto del player en ${guildName}, no se envía el mensaje`);
            return;
        }
        await client.playerMessage.refresh(player.guildId, player.textChannelId);
    }

}