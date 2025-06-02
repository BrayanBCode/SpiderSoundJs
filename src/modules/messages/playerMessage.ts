import { BotClient } from "@/bot/BotClient.js"
import logger from "@/bot/logger.js"
import { formatMS_HHMMSS } from "@/utils/formatMS_HHMMSS.js"
import { createEmptyEmbed, titleCleaner, replyEmbed, deleteAfterTimer } from "@/utils/tools.js"
import { TextChannel, Message, User, ButtonStyle, MessageFlags, ButtonInteraction } from "discord.js"
import { Track, Player } from "lavalink-client"
import { CustomButtonBuilder } from "../buttons/ButtonBuilder.js"
import { DisplayButtonsBuilder } from "../buttons/DisplayButtonsBuilder.js"
import { QueuePaginator } from "../buttons/QueuePaginator.js"


// Se utiliza mucho esta linea client.playerMessage.MessageContainer.delete() acortar a una funcion publica de la clase
export class PlayerMessage {
    MessageContainer: Map<string, {
        channel: TextChannel,
        Message: Message
    }>
    client: BotClient


    constructor(client: BotClient) {
        this.MessageContainer = new Map()
        this.client = client
    }

    async send(guildID: string, channelID?: string) {

        const player = this.client.getPlayer(guildID)

        if (!player) {
            logger.error(`[PlayerMessage] No se encuentra un player para ${this.client.getGuild(guildID)!.name}`)
            return undefined
        }

        const currentTrack = player.queue.current

        if (!currentTrack) {
            logger.error(`[PlayerMessage] No se pudo obtener la cancion actual`)
            return undefined
        }

        let channel = channelID ? this.client.getTextChannel(channelID) : undefined
        channel ??= this.MessageContainer.get(guildID)?.channel

        if (!channel) {
            logger.error(`[PlayerMessage] No se encontro un canal de texto para enviar el mensaje`)
            return undefined
        }

        const view = new DisplayButtonsBuilder(this.client)
        view.addButtons(...this.getButtons())

        const prevButton = view.actionRow.components.find((btn) => btn.custom_id === "prev")!

        if (!player.queue.previous[0]) prevButton.setDisabled(true)
        else prevButton.setDisabled(false)


        const msg = await view.send(channel, this.getPlayingEmbed(currentTrack, player))

        this.MessageContainer.set(guildID, {
            channel: channel,
            Message: msg
        })

        return msg
    }

    async delete(guildID: string) {

        const data = this.MessageContainer.get(guildID)

        if (!data) {
            logger.error(`[PlayerMessage][Ignorable] No se pudo obtener ningun dato`)
            return false
        }

        let message = await data.Message.fetch()

        if (!message.deletable) {
            logger.warn(`[PlayerMessage] No se puede eliminar el mensaje o ya fue eliminado`)
            return false
        }

        await message.delete().catch(() => {
            logger.error(`[PlayerMessage][Ignorable] No se puede eliminar el mensaje`)
        })

        logger.info(`[PlayerMessage] El mensaje "${message.id}" fue eliminado con exito`)
        return true
    }

    deleteData(guilId: string) {
        this.MessageContainer.delete(guilId)
    }

    private getPlayingEmbed(track: Track, player: Player) {
        return createEmptyEmbed()
            .setAuthor({
                name: `Escuchando 🎧`,
                iconURL: (track.requester as User).displayAvatarURL()
            })
            // .setTitle("Escuchando ")
            .setDescription(`[${titleCleaner(track.info.title)}](${track.info.uri})`)
            .addFields(
                { name: "Artista", value: `\`${track.info.author}\``, inline: true },
                { name: "Volumen", value: `\`${player.volume}\``, inline: true },
                { name: "Duración", value: `\`${formatMS_HHMMSS(track.info.duration)}\``, inline: true },
                { name: "En cola", value: `\`${player.queue.tracks.length}\``, inline: true },
                { name: "Loop", value: `\`${player.repeatMode}\``, inline: true },
                {
                    name: "Duración de lista",
                    value: `\`${formatMS_HHMMSS(
                        (player.queue.tracks.reduce((acum, track) => acum + track.info.duration!, 0) + track.info.duration))
                        }\``,
                    inline: true
                },
            )
            .setColor("NotQuiteBlack")
            // .setImage(`https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`)
            .setThumbnail(`${track.info.artworkUrl}`)
        // .setFooter({
        //     text: `Pedido por ${(track.requester as User).globalName}`,
        //     iconURL: (track.requester as User).displayAvatarURL()
        // });
    }

    private getButtons(): CustomButtonBuilder[] {
        return [
            new CustomButtonBuilder({
                custom_id: "queue",
                label: "📋",
                style: ButtonStyle.Secondary
            },
                async (client, inter, col) => {
                    const player = client.getPlayer(inter.guildId)!

                    if (!player.queue.tracks) {
                        return inter.reply({
                            embeds: [
                                createEmptyEmbed()
                                    .setDescription("La lista de reproducción está vacía, utiliza /play para agregar canciones.")
                                    .setColor("Yellow")
                            ],
                            flags: MessageFlags.Ephemeral
                        });
                    }

                    const queue = player.queue.tracks;

                    const paginator = new QueuePaginator({
                        interaction: inter as ButtonInteraction<"cached">,
                        items: queue,
                    });

                    return paginator.reply();
                }),
            new CustomButtonBuilder({
                custom_id: "prev",
                label: "⏪",
                style: ButtonStyle.Secondary
            },
                async (client, inter) => {
                    const player = client.getPlayer(inter.guildId)!

                    await player.play({ track: player.queue.previous[0] });

                    const prevMsg = await replyEmbed({
                        interaction: inter as ButtonInteraction<"cached">,
                        embed: createEmptyEmbed()
                            .setDescription(`Reproduciendo: **${player.queue.previous[0].info.title}**`)
                    });

                    deleteAfterTimer(prevMsg, 10000)
                }),
            new CustomButtonBuilder({
                custom_id: "stop",
                label: "⏹️",
                style: ButtonStyle.Secondary
            },
                async (client, inter, col) => {
                    const player = client.getPlayer(inter.guildId)!

                    await player.stopPlaying(true)

                    const stopMsg = await replyEmbed({
                        interaction: (inter as ButtonInteraction<"cached">),
                        embed: createEmptyEmbed()
                            .setDescription("🛑 Se detuvo la reproducción")
                            .setColor("Blue")
                    })
                    try {
                        col.stop("Track Stopped")
                    } catch (err) {
                        logger.error('col.stop("Track Stopped"): ' + err)
                    }

                    setTimeout(() => {
                        const player = client.getPlayer(inter.guildId);
                        if (player && player.queue.tracks.length === 0) {
                            player.disconnect()
                        }
                    }, 15000)

                    deleteAfterTimer(stopMsg, 10000)
                }),
            new CustomButtonBuilder({
                custom_id: "resume/pause",
                label: "⏯️",
                style: ButtonStyle.Secondary
            },
                async (client, inter, col) => {
                    const player = client.getPlayer(inter.guildId)!

                    player.playing ? await player.pause() : await player.resume();

                    const ResumePlayMsg = await replyEmbed({
                        interaction: inter as ButtonInteraction<"cached">,
                        embed: createEmptyEmbed()
                            .setDescription(`Reproducción ${player.playing ? "⏸️" : "▶️"}`)
                    });

                    deleteAfterTimer(ResumePlayMsg, 5000)
                }),
            new CustomButtonBuilder({
                custom_id: "next",
                label: "⏩",
                style: ButtonStyle.Secondary
            },
                async (client, inter, col) => {
                    const player = client.getPlayer(inter.guildId)!

                    if (!player.queue.tracks.length) {
                        const emptyQueue = await replyEmbed({
                            interaction: inter as ButtonInteraction<"cached">,
                            embed: createEmptyEmbed()
                                .setDescription("❌ No hay suficientes canciones en la lista")
                                .setColor("Yellow")
                        })

                        deleteAfterTimer(emptyQueue, 10000)
                        return
                    }

                    await player.skip()
                    // col.stop("[PlayerMessage - nextBtn] Track skiped")

                    // await client.playerMessage.send(inter.guildId, inter.channelId)

                    const nextMsg = await replyEmbed({
                        interaction: inter as ButtonInteraction<"cached">,
                        embed: createEmptyEmbed()
                            .setDescription(`⏭️ Canción saltada`)
                    });

                    deleteAfterTimer(nextMsg, 10000)
                }),
        ]
    }

} 