// DisplayEngine.ts - A dynamic UI rendering system for Discord bots, allowing creation of interactive interfaces with buttons, select menus, and modals.
import type MusicClient from "@/client/MusicClient";
import logger from "@/utils/logger";
import {
    ActionRowBuilder,
    EmbedBuilder,
    InteractionCollector,
    Message,
    ModalBuilder,
    TextChannel,
    TextInputBuilder,
    TextInputStyle,
    ButtonInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
    RoleSelectMenuInteraction,
    MentionableSelectMenuInteraction,
    ChannelSelectMenuInteraction,
    MessageFlags,
} from "discord.js";



export type UIInteraction =
    | ButtonInteraction
    | StringSelectMenuInteraction
    | UserSelectMenuInteraction
    | RoleSelectMenuInteraction
    | ChannelSelectMenuInteraction
    | MentionableSelectMenuInteraction;

export type UIHandler = (ctx: UIContext) => any

export interface ModalConfig {
    id: string
    title: string
    inputs: {
        id: string
        label: string
        style?: TextInputStyle
        placeholder?: string
        required?: boolean
    }[]
}

export interface UIMessageComponent {
    id: string
    width: number
    autoDefer?: boolean

    build(): any
    onInteract(ctx: UIContext): any
}

export interface UIInteractionComponent {
    id: string
}

export interface UIContext {
    userId: string
    state: any
    values?: string[]
    client: MusicClient
    interaction: UIInteraction

    setState: (data: any) => Promise<void>
    render: () => Promise<void>
    stop: () => void

    showModal: (modal: ModalConfig) => Promise<Record<string, string> | null>
}

interface UIResult {
    embeds?: EmbedBuilder[]
    components: UIMessageComponent[]
    modals?: UIInteractionComponent[]
}

export class DisplayEngine {

    private message?: Message
    private collector?: InteractionCollector<UIInteraction>
    private globalState: Record<string, any> = {}

    constructor(
        private client: MusicClient,
        private guildId: string,
        private view: (state: any) => UIResult
    ) { }

    private getState() {
        return this.globalState
    }

    /* ---------- RENDER ---------- */

    private async render() {

        if (!this.message) return

        const state = this.getState()
        const ui = this.view(state)

        const rows: ActionRowBuilder<any>[] = []

        let row = new ActionRowBuilder<any>()
        let width = 0

        for (const comp of ui.components) {

            if (width + comp.width > 5) {
                rows.push(row)
                row = new ActionRowBuilder<any>()
                width = 0
            }

            row.addComponents(comp.build())
            width += comp.width
        }

        if (row.components.length)
            rows.push(row)

        await this.message.edit({
            content: " ",
            embeds: ui.embeds ?? [],
            components: rows
        })
    }

    /* ---------- SEND ---------- */

    async send(channel: TextChannel) {
        this.message = await channel.send({ content: "Loading UI...", flags: [MessageFlags.SuppressNotifications] })
        await this.render()
        this.createCollector()
    }

    /* ---------- COLLECTOR ---------- */

    private createCollector() {

        if (!this.message) return

        this.collector = this.message.createMessageComponentCollector()

        this.collector.on("collect", async inter => {

            if (!inter.isMessageComponent()) return

            const state = this.getState()
            const ui = this.view(state)

            const comp = ui.components.find(c => c.id === inter.customId)
            if (!comp) return

            const ctx: UIContext = {
                userId: inter.user.id,
                state,
                values: (inter as any).values,
                client: this.client,
                interaction: inter,

                setState: async d => {
                    Object.assign(state, d)
                    await this.render()
                },

                render: async () => this.render(),

                stop: () => this.collector?.stop(),

                showModal: async (config) => {

                    const modal = new ModalBuilder()
                        .setCustomId(config.id + "_" + inter.id)
                        .setTitle(config.title)

                    for (const input of config.inputs) {

                        const field = new TextInputBuilder()
                            .setCustomId(input.id)
                            .setLabel(input.label)
                            .setStyle(input.style ?? TextInputStyle.Short)
                            .setRequired(input.required ?? true)

                        if (input.placeholder)
                            field.setPlaceholder(input.placeholder)

                        modal.addComponents(
                            new ActionRowBuilder<TextInputBuilder>().addComponents(field)
                        )
                    }

                    await inter.showModal(modal)

                    const submit = await inter.awaitModalSubmit({
                        filter: i => i.customId === modal.data.custom_id,
                        time: 120000
                    }).catch(() => null)

                    if (!submit) return null

                    const values: Record<string, string> = {}

                    for (const input of config.inputs)
                        values[input.id] = submit.fields.getTextInputValue(input.id)

                    await submit.deferUpdate()

                    return values
                }
            }

            await comp.onInteract(ctx)

            logger.debug(`Interaction collected: ${inter.customId}, User: ${inter.user.tag}, deferred: ${inter.deferred}, replied: ${inter.replied}, autoDefer: ${comp.autoDefer !== false}`)

            if (comp.autoDefer !== false && !inter.deferred && !inter.replied) {
                logger.debug("Auto-deferring interaction:", inter.customId)
                await inter.deferUpdate().catch(() => { })
            }
        })
    }
}