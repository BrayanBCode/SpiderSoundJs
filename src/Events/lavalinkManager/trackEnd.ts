import { Player, Track, TrackEndEvent } from "lavalink-client/dist/types";
import { BotClient } from "../../class/BotClient.js";
import { BaseLavalinkManagerEvents } from "../../class/events/BaseLavalinkManagerEvents.js";
import logger from "../../class/logger.js";
import { TextChannel } from "discord.js";
import play from "../../commands/music/play.js";

export default class trackEnd extends BaseLavalinkManagerEvents<"trackEnd"> {
    name: "trackEnd" = "trackEnd";
    async execute(client: BotClient, player: Player, track: Track | null, payload: TrackEndEvent): Promise<void> {

        logger.info(`Termino **${track?.info.title}** en **${client.getGuild(player.guildId)?.name}**`);

        // if (player.queue.tracks.length === 0) setTimeout(
        //     () => {
        //         if (player.queue.tracks.length === 0) client.lavaManager.playingMessageController.DeleteMessage(player.guildId, true)
        //     }, 15000)
    }

}

// let msg = client.lavaManager.getGuildMessage(player.guildId)
// const guild = client.guilds.cache.get(player.guildId)

// logger.info(`Termino **${track?.info.title}** en **${guild?.name}**`);

// if (!msg) return

// msg.delete().then((msg) => {
//     // client.lavaManager.destroyGuildMessage(player.guildId)
//     logger.debug(`Mensaje de reprodución eliminado de **${(msg.channel as TextChannel).name}** en **${guild?.name}**`)

// }).catch((err) => { logger.error(err) })