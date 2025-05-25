import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { BaseLavalinkManagerEvents } from "@/structures/events/BaseLavalinkManagerEvents.js";
import { Player, Track, TrackEndEvent } from "lavalink-client";


export default class trackEnd extends BaseLavalinkManagerEvents<"trackEnd"> {
    name: "trackEnd" = "trackEnd";
    async execute(client: BotClient, player: Player, track: Track | null, payload: TrackEndEvent): Promise<void> {

        await client.playerMessage.delete(player.guildId)
        logger.info(`Termino **${track?.info.title}** en **${client.getGuild(player.guildId)?.name}**`);

    }

}