import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { BaseLavalinkManagerEvents } from "@/structures/events/BaseLavalinkManagerEvents.js";
import { TextChannel } from "discord.js";
import { Player, Track, TrackStartEvent } from "lavalink-client";


export default class trackStart extends BaseLavalinkManagerEvents<"trackStart"> {
    name: "trackStart" = "trackStart";
    once: boolean = false;

    async execute(client: BotClient, player: Player, track: Track | null, payload: TrackStartEvent): Promise<void> {

        if (!track) return

        const channel = client.channels.cache.get(player.textChannelId!) as TextChannel | undefined;

        logger.info(`Reproduciendo **${track?.info.title}** en **${client.getGuild(player.guildId)?.name}**`);
        await client.playerMessage.send(player.guildId, channel?.id)

    };
}
