import { Track, UnresolvedTrack } from "lavalink-client/dist/types";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions, Message, MessageFlags, TextChannel } from "discord.js";
import { chunkArray, createEmptyEmbed } from "../../utils/tools.js";
import { formatMS_HHMMSS } from "../../utils/formatMS_HHMMSS.js";
import { IQueuePaginatorOpt } from "../../interface/IQueuePaginatorOpt";
import { IClassQueuePaginator } from "../../interface/IClassQueuePaginator.js";
import logger from "../logger.js";

export class QueuePaginator implements IClassQueuePaginator {



    interaction: ChatInputCommandInteraction<"cached"> | ButtonInteraction<"cached">;
    items: (Track | UnresolvedTrack)[];
    textChannel?: TextChannel;
    pageSize: number;
    timer?: number;
    pages: EmbedBuilder[]

    constructor({ interaction, textChannel, items, pageSize = 10, timer = 60 * 1000 }: IQueuePaginatorOpt) {
        this.interaction = interaction
        this.textChannel = textChannel
        this.items = items
        this.pageSize = pageSize
        this.timer = timer
        this.pages = []

        this.createPages()

    }

    getButtons() {

        if (!this.pages.length) return undefined

        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setCustomId("first").setEmoji("⏪").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("prev").setEmoji("◀").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("next").setEmoji("▶").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("last").setEmoji("⏩").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("stop").setEmoji("⏹").setStyle(ButtonStyle.Danger)
            );

    }

    async reply(ephemeral: boolean = false) {

        const buttons = this.getButtons()
        const initialPage = this.pages[0];

        if (!buttons) return await this.interaction.reply({
            embeds: [createEmptyEmbed()
                .setDescription("No hay canciones en la lista.")
            ]
        })

        const opt: InteractionReplyOptions = {
            embeds: [initialPage],
            components: [buttons],

        }

        if (ephemeral) opt.flags = MessageFlags.Ephemeral

        const msg = await this.interaction.reply(opt)

        const message = await msg.fetch()

        this.handleCollector(message);

        return message

    }

    async followUp(ephemeral: boolean = false) {

        const buttons = this.getButtons()
        const initialPage = this.pages[0];


        if (!buttons) return this.interaction.followUp({
            embeds: [createEmptyEmbed()
                .setDescription("No hay canciones en la lista.")
            ], flags: MessageFlags.Ephemeral
        })

        const opt: InteractionReplyOptions = {
            embeds: [initialPage],
            components: [buttons],

        }

        if (ephemeral) opt.flags = MessageFlags.Ephemeral

        const msg = await this.interaction.followUp(opt)

        const message = await msg.fetch()

        this.handleCollector(message);

        return message

    }

    async send() {
        const buttons = this.getButtons()
        const initialPage = this.pages[0];


        if (!this.textChannel) throw new Error("[QueuePaginator] Falta el valor textChannel")

        if (!buttons) return this.interaction.followUp({
            embeds: [createEmptyEmbed()
                .setDescription("No hay canciones en la lista.")
            ]
        })

        const msg = await this.interaction.reply({
            embeds: [initialPage],
            components: [buttons],
        })

        const message = await msg.fetch()

        this.handleCollector(message);

        return message
    }

    private handleCollector(message: Message) {
        let currentPage = 0;
        const collector = message.createMessageComponentCollector({
            time: this.timer
        });

        collector.on("collect", async (interaction) => {

            try {
                if (interaction.user.id !== this.interaction.user.id) {
                    return interaction.reply({ content: "No puedes usar este paginador.", ephemeral: true });
                }

                switch (interaction.customId) {
                    case "first":
                        currentPage = 0;
                        break;
                    case "prev":
                        if (currentPage > 0) currentPage--;
                        break;
                    case "next":
                        if (currentPage < this.pages.length - 1) currentPage++;
                        break;
                    case "last":
                        currentPage = this.pages.length - 1;
                        break;
                    case "stop":
                        await interaction.update({
                            components: [],
                        })

                        collector.stop()
                        return;
                }

                await interaction.update({
                    embeds: [this.pages[currentPage]],
                    components: [message.components[0]]
                });
            } catch (error) {
                logger.error("[QueuePaginator - collector.on] ", error)
            }
        });

        collector.on("end", () => {
            message.delete().catch(() => { logger.warn("[QueuePaginator] Error irrelevante") })
        });
    }

    private createPages() {
        const chunkedTracks = chunkArray(this.items, this.pageSize)

        this.pages.push(...chunkedTracks.map(
            (tracks, index) => {
                return createEmptyEmbed()
                    .setTitle("Lista de Reproducción")
                    .addFields(...tracks.map((track, subIndex) => {
                        const globalIndex = index * this.pageSize + subIndex + 1; // Índice global
                        return {
                            name: `🎵${globalIndex}. ${track.info.title}`,
                            value: `duración: ${formatMS_HHMMSS(track.info.duration!)}`
                        }
                    }))
            })
        )
    }




}

