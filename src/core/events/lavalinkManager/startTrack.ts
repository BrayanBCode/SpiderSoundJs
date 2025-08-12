import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { BaseMoonLinkManagerEvents } from "@/structures/events/BaseLavalinkManagerEvents.js";
import { TextChannel } from "discord.js";
import { Player, Track } from "moonlink.js";


export default class trackStart extends BaseMoonLinkManagerEvents<"trackStart"> {
    name: "trackStart" = "trackStart";
    once: boolean = false;

    async execute(client: BotClient, player: Player, track: Track): Promise<void> {

        if (!track) return

        const channel = client.channels.cache.get(player.textChannelId!) as TextChannel | undefined;

        logger.info(`Reproduciendo **${track.title}** en **${client.getGuild(player.guildId)?.name}**`);
        await client.playerMessage.delete(player.guildId)
        await client.playerMessage.send(player.guildId, channel?.id)
    };
}


