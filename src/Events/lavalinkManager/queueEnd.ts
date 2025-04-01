import { Player, Track, UnresolvedTrack, TrackEndEvent, TrackStuckEvent, TrackExceptionEvent } from "lavalink-client/dist/types";
import { BotClient } from "../../class/BotClient.js";
import { BaseLavalinkManagerEvents } from "../../class/events/BaseLavalinkManagerEvents.js";
import { TextChannel } from "discord.js";
import logger from "../../class/logger.js";
import { createEmptyEmbed, simpleEmbedReply } from "../../utils/tools.js";

export default class queueEnd extends BaseLavalinkManagerEvents<"queueEnd"> {
    name: "queueEnd" = "queueEnd";

    async execute(client: BotClient, player: Player, track: Track | UnresolvedTrack | null, payload: TrackEndEvent | TrackStuckEvent | TrackExceptionEvent): Promise<void> {
        let msg = client.lavaManager.playingMessageController.getMessage(player.guildId)
        const channel = msg
            ? msg.channel as TextChannel
            : client.channels.cache.get(player.textChannelId!) as TextChannel | undefined;


        if (channel) {
            const emptyMsg = await channel.send({
                embeds: [
                    createEmptyEmbed()
                        .setAuthor({
                            name: "Cola de reproducción vacía"
                        })
                        .setDescription(`Utiliza el comando /play para agregar mas canciones.`)
                ],

            })

            setTimeout(async () => {
                emptyMsg.delete().catch((err) => logger.error("[queueEnd]", err))
            }, 15000)
        }

        if (msg) setTimeout(async () => {
            try {
                if (player.playing) return

                await player.disconnect();
                await player.destroy("[Playing Message controller] Destoyed by Inactivity", true)

                await client.playingMessage.DeleteMessage(player.guildId, true).then(
                    async (msg) => {
                        if (!msg) return

                        await (msg.channel as TextChannel).send({
                            embeds: [createEmptyEmbed().setAuthor({ name: "Desconexión por inactividad" })]
                        })
                    }
                )



                // msg = client.lavaManager.getGuildMessage(player.guildId)

                // if (msg) msg.delete()
                //     .then(() => client.lavaManager.destroyGuildMessage(player.guildId))
                //     .catch((err) => logger.error(err))

                // if (channel) {
                //     const embed = createEmptyEmbed()
                //         .setAuthor({ name: "Desconexiòn por inactividad" });

                //     await channel.send({ embeds: [embed] });
                // }

            } catch (error) {
                logger.error("Error durante la desconexión por inactividad:", error);
            }
        }, 15000);

    }

}