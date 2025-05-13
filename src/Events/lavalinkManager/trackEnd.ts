import { Player, Track, TrackEndEvent } from "lavalink-client/dist/types";
import { BotClient } from "../../class/BotClient.js";
import { BaseLavalinkManagerEvents } from "../../class/events/BaseLavalinkManagerEvents.js";
import logger from "../../class/logger.js";

export default class trackEnd extends BaseLavalinkManagerEvents<"trackEnd"> {
    name: "trackEnd" = "trackEnd";
    async execute(client: BotClient, player: Player, track: Track | null, payload: TrackEndEvent): Promise<void> {

        await client.playerMessage.delete(player.guildId)
        logger.info(`Termino **${track?.info.title}** en **${client.getGuild(player.guildId)?.name}**`);

    }

}