import { ActionRowBuilder, APIMessageComponentEmoji, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Message, TextChannel } from "discord.js"
import { interactionButtonType, interactionCommandType } from "../../types/types/interactionCommandType.js";
import { BClient } from "../client/BClient.js";
import { ButtonInteraction, CacheType, ChannelSelectMenuInteraction, InteractionCollector, MentionableSelectMenuInteraction, RoleSelectMenuInteraction, StringSelectMenuInteraction, UserSelectMenuInteraction } from "discord.js";
import logger from "../client/logger.js";
import { safeDelete } from "../../utils/messages.js";

export interface ICustomButtonBuilder {
    custom_id: string
    /** Texto del botón; opcional si tiene emoji */
    label?: string
    style?: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger
    emoji?: APIMessageComponentEmoji
    disabled?: boolean
}

export type collectorType =
    | InteractionCollector<
        | ButtonInteraction<CacheType>
        | StringSelectMenuInteraction<CacheType>
        | UserSelectMenuInteraction<CacheType>
        | RoleSelectMenuInteraction<any>
        | MentionableSelectMenuInteraction<any>
        | ChannelSelectMenuInteraction<any>
    >

export type IButtonInteraction =
    | InteractionCollector<
        | ButtonInteraction<CacheType>
        | StringSelectMenuInteraction<CacheType>
        | UserSelectMenuInteraction<CacheType>
        | RoleSelectMenuInteraction<any>
        | MentionableSelectMenuInteraction<any>
        | ChannelSelectMenuInteraction<any>
    >

export class CustomButtonBuilder extends ButtonBuilder {
    // client: BotClient
    custom_id: string;
    label?: string;
    style?: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger;
    emoji?: APIMessageComponentEmoji;
    disabled?: boolean;
    type: ComponentType.Button;
    execute: (client: BClient, inter: interactionButtonType, col: collectorType, button: CustomButtonBuilder) => void;

    constructor({ custom_id, label, style, emoji, disabled }: ICustomButtonBuilder, execute: (client: BClient, inter: interactionButtonType, col: collectorType, button: CustomButtonBuilder) => void) {

        super({ custom_id, label, style, emoji, disabled });

        this.custom_id = custom_id;
        this.label = label;
        this.style = style ?? ButtonStyle.Secondary;
        this.emoji = emoji;
        this.disabled = disabled;
        this.type = ComponentType.Button;
        this.execute = execute;
    }

}

/**
 * Clase encargada de construir y manejar un grupo de botones personalizados para mostrar en un mensaje,
 * con soporte para interacción por componentes.
 */
export class DisplayButtonsBuilder {

    // Fila de botones que se mostrará en el mensaje
    actionRows: ActionRowBuilder<CustomButtonBuilder>[]

    // Instancia del cliente del bot, para poder acceder a sus propiedades/métodos
    client: BClient

    // ID del servidor (guild) donde se enviarán los botones
    guildId: string

    constructor(client: BClient, guildId: string) {
        this.actionRows = []
        this.client = client
        this.guildId = guildId
    }

    /**
     * Crea un colector de interacciones para el mensaje dado y lo asocia a los botones agregados.
     * @param message Mensaje en el que se desea activar el colector de botones
     */
    private createCollector(message: Message) {
        const collector = message.createMessageComponentCollector()
        this.interactionHandler(message, collector)
    }

    /**
     * Activa y gestiona las interacciones con los botones agregados.
     * Ejecuta el comportamiento definido por cada botón cuando se presiona.
     * 
     * Revisa {@link handleCollector} para modificar el comportamiento de finalización.
     * 
     * @param message Mensaje que contiene los botones
     * @param col Colector de interacciones generado
     */
    private interactionHandler(message: Message, col: collectorType) {
        logger.debug(`interactionHandler created`)
        col.on("collect", (inter) => this.execute(inter as interactionButtonType, col))

        // Permite sobreescribir el comportamiento al finalizar la colección
        this.handleCollector(message, col)
    }


    /**
     * Maneja los eventos al finalizar la recolección de interacciones con botones.
     * 
     * Por defecto, elimina el mensaje al terminar.
     * Puedes sobreescribir esta función para personalizar ese comportamiento.
     * 
     * @example
     * col.on("end", () => {
     *     message.delete().catch(() => {
     *         logger.error("Error al eliminar el mensaje")
     *     })
     * })
     * 
     * @param message Mensaje que contiene los botones
     * @param col Colector activo de interacciones
     */
    protected handleCollector(message: Message, col: IButtonInteraction) {
        col.on("end", (_collected, reason) => {
            if (reason === "messageDelete") return
            safeDelete(message, "DisplayButtonsBuilder")
        })
    }

    /**
     * Ejecuta la acción correspondiente al botón presionado.
     * 
     * @param inter Interacción generada por el botón
     * @param col Colector de interacciones activo
     */
    private execute(inter: interactionButtonType, col: collectorType) {
        for (const row of this.actionRows) {
            for (const button of row.components) {
                if (inter.customId !== button.custom_id) continue

                logger.debug(`[DisplayButtonsBuilder] Ejecutando botón ${inter.customId}`)
                Promise.resolve(button.execute(this.client, inter, col, button)).catch(err =>
                    logger.error(`[DisplayButtonsBuilder] Error en el botón ${inter.customId}:`, err))
                return
            }
        }
    }

    /**
     * Agrega uno o más botones a la fila de componentes.
     * 
     * @param components Botones personalizados a agregar
     */
    public addButtons(...components: CustomButtonBuilder[]) {
        this.actionRows = [] // Reiniciar filas

        for (let i = 0; i < components.length; i += 5) {
            const row = new ActionRowBuilder<CustomButtonBuilder>().addComponents(
                ...components.slice(i, i + 5)
            )
            this.actionRows.push(row)
        }
    }

    /**
     * Envía un mensaje con los botones al canal especificado.
     * 
     * @param channel Canal donde se enviará el mensaje
     * @param embeds Embeds a incluir en el mensaje
     * @returns Mensaje enviado
     */
    public async send(channel: TextChannel, ...embeds: EmbedBuilder[]) {
        const msg = await channel.send({
            embeds,
            components: this.actionRows
        })

        this.createCollector(msg)
        return msg
    }

    /**
     * Envía una respuesta posterior (followUp) a una interacción, con los botones.
     * 
     * @param inter Interacción que se está respondiendo
     * @param embeds Embeds a incluir en la respuesta
     * @returns Mensaje enviado
     */
    public async followUp(inter: interactionCommandType, embeds: EmbedBuilder[]) {
        const msg = await inter.followUp({
            embeds,
            components: this.actionRows
        })

        this.createCollector(msg)
        return msg
    }

    /**
     * Responde directamente a una interacción con botones.
     * 
     * @param inter Interacción que se está respondiendo
     * @param embeds Embeds a incluir en la respuesta
     * @returns Mensaje enviado
     */
    public async reply(inter: interactionCommandType, embeds: EmbedBuilder[]) {
        const msg = await (await inter.reply({
            embeds,
            components: this.actionRows
        })).fetch()

        this.createCollector(msg)
        return msg
    }

}


