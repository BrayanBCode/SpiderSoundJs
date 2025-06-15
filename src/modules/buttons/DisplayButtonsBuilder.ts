import { BotClient } from "@/bot/BotClient.js"
import logger from "@/bot/logger.js"
import { IButtonInteraction } from "@/types/interface/IButtonInteraction.js"
import { collectorType } from "@/types/types/collectorTypes.js"
import { interactionButtonType, interactionCommandType } from "@/types/types/interactionCommandType.js"
import { ActionRowBuilder, Message, TextChannel, EmbedBuilder } from "discord.js"
import { CustomButtonBuilder } from "./ButtonBuilder.js"


/**
 * Clase encargada de construir y manejar un grupo de botones personalizados para mostrar en un mensaje,
 * con soporte para interacción por componentes.
 */
export class DisplayButtonsBuilder {

    // Fila de botones que se mostrará en el mensaje
    actionRows: ActionRowBuilder<CustomButtonBuilder>[]

    // Instancia del cliente del bot, para poder acceder a sus propiedades/métodos
    client: BotClient

    // ID del servidor (guild) donde se enviarán los botones
    guildId: string

    constructor(client: BotClient, guildId: string) {
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
        col.on("end", () => {
            message.delete().catch(() => {
                logger.warn("[DisplayButtonsBuilder] Error al eliminar el mensaje")
            })
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

                logger.debug(`Ejecutando interación de ${inter.customId}`)
                button.execute(this.client, inter, col, button)
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


