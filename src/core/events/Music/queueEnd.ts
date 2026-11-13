import { Player } from "moonlink.js";
import { MEvent } from "../../classes/events/MEvent.js";
import { BClient } from "../../client/BClient.js";
import logger from "../../client/logger.js";
import { TextChannel } from "discord.js";
import { EmptyEmbed } from "../../../utils/messages.js";
import { startInactivityTimer } from "../Bot/voiceStateUpdate.js";

export default class queueEnd extends MEvent<"queueEnd"> {

    constructor() {
        super("queueEnd");
    }

    execute(client: BClient, player: Player, track?: any): Promise<void> | void {
        logger.debug(`[QueueEnd] Cola finalizada en ${client.getGuild(player.guildId)?.name ?? player.guildId}`);
        startInactivityTimer(client, player.guildId, "cola finalizada");

        const txtChannel = (player.textChannelId ? client.channels.cache.get(player.textChannelId) : undefined);

        if (!txtChannel?.isTextBased() || !("permissionsFor" in txtChannel) || !(txtChannel instanceof TextChannel)) return;

        const perms = txtChannel.permissionsFor(client.user!);
        if (!perms?.has(["SendMessages", "ViewChannel"])) return;

        txtChannel.send({
            embeds: [
                EmptyEmbed()
                    .setAuthor({ name: "⏭️ | lista de reproducción", iconURL: client.user?.displayAvatarURL() ?? "" })
                    .setDescription("🗿 Queue finalizada.")
                    .setColor("Yellow")
            ]
        }).catch(err => logger.error("[QueueEnd] Error enviando mensaje de cola finalizada:", err));

    }
}