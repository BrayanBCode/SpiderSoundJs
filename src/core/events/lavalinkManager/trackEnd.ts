import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { BaseMoonLinkManagerEvents } from "@/structures/events/BaseLavalinkManagerEvents.js";
import { Player, Track, TTrackEndType } from "moonlink.js";


export default class trackEnd extends BaseMoonLinkManagerEvents<"trackEnd"> {
    name: "trackEnd" = "trackEnd";
    once: boolean = false;

    execute(client: BotClient, player: Player, track: Track, type: TTrackEndType, payload?: any): void {
        logger.info(`Termino **${track.title}** en **${client.getGuild(player.guildId)?.name}**`);
    }

}