import { ButtonInteraction, ButtonStyle, GuildMember, Message, MessageFlags, TextChannel, User } from "discord.js"
import { CustomButtonBuilder, DisplayButtonsBuilder, IButtonInteraction } from "./DisplayButtonsBuilder.js"
import logger from "../client/logger.js"
import { BClient } from "../client/BClient.js"
import { Player, Track } from "moonlink.js"
import { deleteAfterTimer, EmptyEmbed, safeDelete, replyEmbed } from "../../utils/messages.js"
import { replyNoPlayer, skipTrack, getRequesterInfo, seekRelative } from "../music/player.js"
import { formatMS_HHMMSS, titleCleaner } from "../../utils/tools.js"
import { QueuePaginator } from "../classes/music/QueuePaginator.js"
import { PLAYER_EMOJIS } from "./emojis.js"



class PlayingButtons extends DisplayButtonsBuilder {

    protected handleCollector(message: Message, col: IButtonInteraction): void {

        col.on("end", async (_collected, reason) => {
            logger.debug(`[PlayingButtons] Collector finalizado (${reason}) para el mensaje ${message.id}`)
            // PlayerMessage.delete ya lo borró: el collector termina justamente por eso
            if (reason === "messageDelete") return

            if (await safeDelete(message, "PlayingButtons"))
                logger.info(`[PlayingButtons] Mensaje ${message.id} eliminado`)
        })

    }

}


export class PlayerMessage {
    MessageContainer: Map<string, {
        channel: TextChannel,
        Message: Message,
        view: PlayingButtons
    }>
    client: BClient

    /**
     * Última operación encolada por servidor. Enviar, editar y borrar son asíncronos: con
     * skips seguidos se disparaban dos trackStart a la vez (dos mensajes, o una edición vieja
     * pisando a la nueva). Encadenarlas evita que se pisen.
     */
    private pending = new Map<string, Promise<unknown>>()


    constructor(client: BClient) {
        this.MessageContainer = new Map()
        this.client = client
    }

    private enqueue<T>(guildID: string, task: () => Promise<T>): Promise<T> {
        const previous = this.pending.get(guildID) ?? Promise.resolve()
        const next = previous.catch(() => { }).then(task)
        this.pending.set(guildID, next)
        next.finally(() => { if (this.pending.get(guildID) === next) this.pending.delete(guildID) }).catch(() => { })
        return next
    }

    /**
     * Muestra la canción actual en el mensaje "Escuchando".
     *
     * Si el mensaje sigue siendo el último del canal se edita (sin parpadeo ni llamadas extra);
     * si el chat ya lo tapó o cambió el canal, se borra y se envía uno nuevo abajo.
     */
    refresh(guildID: string, channelID?: string) {
        return this.enqueue(guildID, async () => {
            const data = this.getData(guildID)
            const sameChannel = data && (!channelID || data.channel.id === channelID)

            if (data && sameChannel && data.channel.lastMessageId === data.Message.id && await this.edit(guildID))
                return data.Message

            if (data) logger.debug(`[PlayerMessage] Se reenvía el mensaje en ${data.channel.guild.name} (${sameChannel ? "quedó tapado por el chat" : "cambió el canal"})`)
            await this.delete(guildID)
            return this.send(guildID, channelID)
        })
    }

    /** Borra el mensaje "Escuchando" (cuando el player se destruye) */
    remove(guildID: string) {
        return this.enqueue(guildID, () => this.delete(guildID))
    }

    /** Actualiza el embed y los botones del mensaje existente. `false` si no se pudo (ej. lo borraron) */
    private async edit(guildID: string): Promise<boolean> {
        const data = this.getData(guildID)
        const player = this.client.getPlayer(guildID)
        if (!data || !player?.current) return false

        this.updatePrevButton(data.view, player)
        try {
            await data.Message.edit({ embeds: [this.getPlayingEmbed(player.current, player)], components: data.view.actionRows })
            logger.debug(`[PlayerMessage] Mensaje "Escuchando" editado para "${player.current.title}" en ${data.channel.guild.name}`)
            return true
        } catch (err) {
            logger.debug(`[PlayerMessage] No se pudo editar el mensaje ${data.Message.id}, se reenvía: ${err}`)
            return false
        }
    }

    /** ⏮️ se deshabilita si no hay canción anterior */
    private updatePrevButton(view: PlayingButtons, player: Player) {
        view.actionRows[0].components.find((btn) => btn.custom_id === "prev")?.setDisabled(!player.previous.at(-1))
    }

    async send(guildID: string, channelID?: string) {

        const player = this.client.getPlayer(guildID)

        if (!player) {
            logger.error(`[PlayerMessage] No se encuentra un player para ${this.client.getGuild(guildID)!.name}`)
            return undefined
        }

        const currentTrack = player.current

        if (!currentTrack) {
            logger.error(`[PlayerMessage] No se pudo obtener la cancion actual`)
            return undefined
        }

        let channel = channelID ? this.client.getTextChannel(channelID) : undefined
        channel ??= this.getData(guildID)?.channel

        channel = channel as TextChannel

        if (!channel) {
            logger.error(`[PlayerMessage] No se encontro un canal de texto para enviar el mensaje`)
            return undefined
        }

        const view = new PlayingButtons(this.client, guildID)
        view.addButtons(...this.getButtons())

        this.updatePrevButton(view, player)

        const msg = await view.send(channel, this.getPlayingEmbed(currentTrack, player))

        if (!this.client.getPlayer(guildID)) {
            logger.debug(`[PlayerMessage] El player se destruyó mientras se enviaba el mensaje, se elimina`)
            await safeDelete(msg, "PlayerMessage")
            return undefined
        }

        logger.debug(`[PlayerMessage] Mensaje "Escuchando" enviado para "${currentTrack.title}" en ${channel.guild.name}`)
        this.MessageContainer.set(guildID, { channel, Message: msg, view })

        return msg
    }

    /** Solo se llama desde la cola (refresh/remove), así que no hay dos borrados a la vez */
    private async delete(guildID: string) {
        const data = this.getData(guildID)
        if (!data) return false

        this.MessageContainer.delete(guildID)
        const deleted = await safeDelete(data.Message, "PlayerMessage")
        if (deleted) logger.debug(`[PlayerMessage] El mensaje "${data.Message.id}" fue eliminado`)
        return deleted
    }

    getData(guildID: string) {
        return this.MessageContainer.get(guildID)
    }

    private getPlayingEmbed(track: Track, player: Player) {
        const requester = getRequesterInfo(track.requester)


        return EmptyEmbed()
            .setAuthor({ name: 'Escuchando 🎶', iconURL: requester.avatar })
            .setTitle(titleCleaner(track.title, track.author) ?? "Titulo desconocido")
            .setURL(track.uri ?? "")
            .setThumbnail(track.artworkUrl ?? "")
            .addFields(
                { name: "Artista", value: `\`${track.author ?? "Desconocido"} \``, inline: true },
                { name: "Duración", value: `\`${formatMS_HHMMSS(track.duration)}\``, inline: true },
                { name: "loop", value: `\`${player.loop}\``, inline: true },
            )
            .setColor(0x1DB954)
            .setFooter({ text: `Pedido por ${requester.name}`, iconURL: this.client.getGuild(player.guildId)?.iconURL() ?? undefined })
            .setTimestamp()
    }

    /**
     * Botones del reproductor. Si el player ya no existe (mensaje viejo), responden
     * "no hay nada reproduciéndose" en vez de fallar.
     */
    private getButtons(): CustomButtonBuilder[] {
        const buttons = this.buildButtons()

        for (const button of buttons) {
            const run = button.execute
            button.execute = async (client, inter, col, btn) => {
                const player = client.getPlayer(inter.guildId!)
                if (!player) return void await replyNoPlayer(inter as ButtonInteraction<"cached">)

                // Ver la cola es inofensivo; el resto controla la reproducción de quienes están escuchando
                const memberVC = (inter.member as GuildMember | null)?.voice.channelId
                if (button.custom_id !== "queue" && memberVC !== player.voiceChannelId) {
                    logger.info(`[PlayerButtons] ${inter.user.username} intentó usar ${button.custom_id} fuera del canal de voz del bot en ${inter.guild?.name}`)
                    deleteAfterTimer(await replyEmbed({
                        interaction: inter as ButtonInteraction<"cached">,
                        embed: EmptyEmbed()
                            .setDescription("❌ | Tienes que estar en el canal de voz del bot para usar este botón.")
                            .setColor("Red"),
                        ephemeral: true,
                    }), 10000)
                    return
                }

                logger.info(`[PlayerButtons] ${inter.user.username} usó ${button.custom_id} en ${inter.guild?.name}`)
                return run(client, inter, col, btn)
            }
        }

        return buttons
    }

    private buildButtons(): CustomButtonBuilder[] {
        return [
            new CustomButtonBuilder({
                custom_id: "queue",
                emoji: PLAYER_EMOJIS.queue,
                style: ButtonStyle.Secondary
            },
                async (client, inter, col) => {
                    const player = client.getPlayer(inter.guildId)!

                    if (!player.queue.tracks.length) {
                        return inter.reply({
                            embeds: [
                                EmptyEmbed()
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
                }
            ),
            new CustomButtonBuilder({
                custom_id: "prev",
                emoji: PLAYER_EMOJIS.prev,
                style: ButtonStyle.Secondary
            },
                async (client, inter) => {
                    const player = client.getPlayer(inter.guildId)!

                    const wentBack = await player.back();

                    const prevMsg = await replyEmbed({
                        interaction: inter as ButtonInteraction<"cached">,
                        embed: EmptyEmbed()
                            .setDescription(wentBack
                                ? `Reproduciendo: **${player.current?.title ?? "canción anterior"}**`
                                : "❌ No hay una canción anterior")
                    });

                    deleteAfterTimer(prevMsg, 10000)
                }
            ),

            new CustomButtonBuilder({
                custom_id: "resume/pause",
                emoji: PLAYER_EMOJIS.playpause,
                style: ButtonStyle.Secondary
            },
                async (client, inter, col) => {
                    const player = client.getPlayer(inter.guildId)!

                    player.playing ? player.pause() : player.resume();

                    const ResumePlayMsg = await replyEmbed({
                        interaction: inter as ButtonInteraction<"cached">,
                        embed: EmptyEmbed()
                            .setDescription(`Reproducción ${player.playing ? "⏸️" : "▶️"}`)
                    });

                    deleteAfterTimer(ResumePlayMsg, 5000)
                }
            ),
            new CustomButtonBuilder({
                custom_id: "next",
                emoji: PLAYER_EMOJIS.next,
                style: ButtonStyle.Secondary
            },
                async (client, inter, col) => {
                    const player = client.getPlayer(inter.guildId)!

                    // Con loop de cola, saltar la única canción la vuelve a poner desde el principio
                    if (!player.queue.size && player.loop !== "queue") {
                        const emptyQueue = await replyEmbed({
                            interaction: inter as ButtonInteraction<"cached">,
                            embed: EmptyEmbed()
                                .setDescription("❌ No hay suficientes canciones en la lista")
                                .setColor("Yellow")
                        })

                        deleteAfterTimer(emptyQueue, 10000)
                        return
                    }

                    await skipTrack(player)


                    const nextMsg = await replyEmbed({
                        interaction: inter as ButtonInteraction<"cached">,
                        embed: EmptyEmbed()
                            .setDescription(`⏭️ Canción saltada`)
                    });

                    deleteAfterTimer(nextMsg, 10000)
                }
            ),
            new CustomButtonBuilder({
                custom_id: "favorite",
                emoji: PLAYER_EMOJIS.favorite,
                style: ButtonStyle.Secondary,
                disabled: true // Se habilita cuando estén los favoritos por usuario
            }, () => {
                //TODO: guardar/quitar la canción actual de los favoritos del usuario 
            }),
            new CustomButtonBuilder({
                custom_id: "loop",
                emoji: PLAYER_EMOJIS.loop,
                style: ButtonStyle.Secondary
            },
                async (client, inter, col) => {
                    const player = client.getPlayer(inter.guildId)!

                    if (player.loop === "off") {
                        player.setLoop("track");
                        await inter.reply({
                            embeds: [
                                EmptyEmbed()
                                    .setDescription("🔁 Repetición de la **canción** activada")
                                    .setColor("Green")
                            ],
                            flags: MessageFlags.Ephemeral
                        });
                    } else if (player.loop === "track") {
                        player.setLoop("queue");
                        await inter.reply({
                            embeds: [
                                EmptyEmbed()
                                    .setDescription("🔂 Repetición de la **cola** activada")
                                    .setColor("Green")
                            ],
                            flags: MessageFlags.Ephemeral
                        });
                    } else {
                        player.setLoop("off");
                        await inter.reply({
                            embeds: [
                                EmptyEmbed()
                                    .setDescription("🔁 Repetición desactivada")
                                    .setColor("Green")
                            ],
                            flags: MessageFlags.Ephemeral
                        });
                    }
                }
            ),
            new CustomButtonBuilder({
                custom_id: "b10s",
                emoji: PLAYER_EMOJIS.back10,
                style: ButtonStyle.Secondary
            },
                async (client, inter, col) => {
                    const player = client.getPlayer(inter.guildId)!;
                    await seekRelative(player, -10_000);

                    deleteAfterTimer(
                        await inter.reply({
                            embeds: [
                                EmptyEmbed()
                                    .setDescription("⏪ Retrocediendo 10 segundos")
                                    .setColor("Green")
                            ],
                            flags: MessageFlags.Ephemeral
                        }), 1000);
                }),
            new CustomButtonBuilder({
                custom_id: "stop",
                emoji: PLAYER_EMOJIS.stop,
                style: ButtonStyle.Secondary
            },
                async (client, inter, col) => {
                    const player = client.getPlayer(inter.guildId)!

                    const stopMsg = await replyEmbed({
                        interaction: (inter as ButtonInteraction<"cached">),
                        embed: EmptyEmbed()
                            .setDescription("🛑 Se detuvo la reproducción")
                            .setColor("Blue")
                    })

                    // destroy borra este mensaje vía playerDestroy, y eso cierra el collector
                    logger.info(`[Stop] ${inter.user.username} detuvo la reproducción con el botón ⏹️ en ${inter.guild?.name}`)
                    await player.destroy("stop")

                    deleteAfterTimer(stopMsg, 10000)
                }
            ),
            new CustomButtonBuilder({
                custom_id: "f15s",
                emoji: PLAYER_EMOJIS.fwd15,
                style: ButtonStyle.Secondary
            },
                async (client, inter, col) => {
                    const player = client.getPlayer(inter.guildId)!;
                    await seekRelative(player, 15_000);

                    deleteAfterTimer(
                        await inter.reply({
                            embeds: [
                                EmptyEmbed()
                                    .setDescription("⏩ Avanzando 15 segundos")
                                    .setColor("Green")
                            ],
                            flags: MessageFlags.Ephemeral
                        }), 1000);
                }),
            new CustomButtonBuilder({
                custom_id: "shuffle",
                emoji: PLAYER_EMOJIS.shuffle,
                style: ButtonStyle.Secondary
            },
                async (client, inter, col) => {
                    const player = client.getPlayer(inter.guildId)!

                    if (!player.queue.tracks.length) {
                        const emptyQueue = await replyEmbed({
                            interaction: inter as ButtonInteraction<"cached">,
                            embed: EmptyEmbed()
                                .setDescription("❌ No hay canciones en la lista para mezclar")
                                .setColor("Yellow")
                        })

                        deleteAfterTimer(emptyQueue, 10000)
                        return
                    }

                    await player.queue.shuffle();
                    await inter.reply({
                        embeds: [
                            EmptyEmbed()
                                .setDescription("🔀 Lista mezclada")
                                .setColor("Green")
                        ],
                        flags: MessageFlags.Ephemeral
                    });
                }
            ),
        ]
    }

}
