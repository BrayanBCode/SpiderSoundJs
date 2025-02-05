import { Player, Track, UnresolvedTrack, TrackEndEvent, TrackStuckEvent, TrackExceptionEvent } from "lavalink-client/dist/types";
import { BotClient } from "../../class/BotClient.js";
import { BaseLavalinkManagerEvents } from "../../class/events/BaseLavalinkManagerEvents.js";
import { TextChannel } from "discord.js";
import logger from "../../class/logger.js";

export default class queueEnd extends BaseLavalinkManagerEvents<"queueEnd"> {
    name: "queueEnd" = "queueEnd";

    async execute(client: BotClient, player: Player, track: Track | UnresolvedTrack | null, payload: TrackEndEvent | TrackStuckEvent | TrackExceptionEvent): Promise<void> {
        let msg = client.lavaManager.getGuildMessage(player.guildId)
        const channel = msg
            ? msg.channel as TextChannel
            : client.channels.cache.get(player.textChannelId!) as TextChannel | undefined;


        if (channel) await channel.send({
            embeds: [
                client.Tools.createEmbedTemplate()
                    .setAuthor({
                        name: "Cola de reproducción vacía"
                    })
                    .setDescription(`Utiliza el comando /play para agregar mas canciones.`)
            ]
        })

        if (msg) setTimeout(async () => {
            try {
                if (player.playing) return

                await player.disconnect();

                msg = client.lavaManager.getGuildMessage(player.guildId)

                if (msg) msg.delete()
                    // .then(() => client.lavaManager.destroyGuildMessage(player.guildId))
                    .catch((err) => logger.error(err))

                if (channel) {
                    const embed = client.Tools.createEmbedTemplate()
                        .setAuthor({ name: "Desconexión por inactividad" });

                    await channel.send({ embeds: [embed] });
                }
            } catch (error) {
                logger.error("Error durante la desconexión por inactividad:", error);
            }
        }, 15000);

    }

}