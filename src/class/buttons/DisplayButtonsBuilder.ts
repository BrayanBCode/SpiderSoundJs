import { ActionRowBuilder, EmbedBuilder, Message, TextChannel } from "discord.js";
import { interactionButtonType, interactionCommandType } from "../../types/interactionCommandType";
import { BotClient } from "../BotClient";
import { collectorType } from "../../types/collectorTypes";
import { CustomButtonBuilder } from "./ButtonBuilder.js";
import logger from "../logger.js";
import { IButtonInteraction } from "../../interface/IButtonInteraction";


export class DisplayButtonsBuilder {

    actionRow: ActionRowBuilder<CustomButtonBuilder>
    client: BotClient

    constructor(client: BotClient) {
        this.actionRow = new ActionRowBuilder<CustomButtonBuilder>()
        this.client = client
    }


    private createCollector(message: Message) {
        const collector = message.createMessageComponentCollector()

        this.interactionHandler(message, collector)
    }

    /**
     * Activa y ejecuta las interaciones con los botones
     * @description
     * ejecuta el comportamiento establecido por cada boton agregado
     * 
     * Revisa {@link handleCollector} para mas informacion
     * 
     * @param message 
     * @param col 
     */
    private interactionHandler(message: Message, col: collectorType) {

        logger.debug(`interactionHandler created`)

        col.on("collect", (inter) => {
            this.execute(inter as interactionButtonType, col)
        })

        // agregar logica de Stop, poner una funcion overraidabe (sobreescribible) para controlar el caso de remover botones y o el mensaje 
        this.handleCollector(message, col)

    }

    /**
     * Se encarga de escuchar los eventos, por defecto elimina el mensaje al terminar el uso con col.stop()
     * 
     * Sobreescribe esta funcion para modificar el comportamiento
     * 
     * @example
     * col.on("end", () => {
     *       message.delete().catch(() => { logger.error("[DisplayButtonsBuilder] Error al eliminar el mensaje") })
     *  })
     * 
     * @param message
     * @param col 
     */
    protected handleCollector(message: Message, col: IButtonInteraction) {

        col.on("end", () => {
            message.delete().catch(() => {
                // Este error es esperado si eliminas el mensaje por otro metodo que no sea col.stop()
                // Tal vez agrege un metodo publico que solo haga col.stop(), pd: no quiero guardar en una variable collection
                logger.warn("[DisplayButtonsBuilder] Error al eliminar el mensaje")
            })
        })

    }

    /**
     * Ejecuta el comportamiento del boton pulsado
     * 
     * @param inter 
     * @param col 
     */
    private execute(inter: interactionButtonType, col: collectorType) {
        for (const button of this.actionRow.components) {

            if (inter.customId != button.custom_id) {
                // logger.debug(`Posible interación ${inter.customId}`)
                continue
            }

            logger.debug(`Ejecutando interación de ${inter.customId}`);
            button.execute(this.client, inter, col, button)
        }

    }

    public addButtons(...components: CustomButtonBuilder[]) {
        this.actionRow.addComponents(components)
    }

    public async send(channel: TextChannel, ...embeds: EmbedBuilder[]) {
        const msg = await channel.send({
            embeds, components: [this.actionRow]
        })

        this.createCollector(msg)
        return msg
    }

    public async followUp(inter: interactionCommandType, embeds: EmbedBuilder[]) {
        const msg = await inter.followUp({ embeds, components: [this.actionRow] })

        this.createCollector(msg)
        return msg
    }

    public async reply(inter: interactionCommandType, embeds: EmbedBuilder[]) {
        const msg = await (await inter.reply({ embeds, components: [this.actionRow] })).fetch()

        this.createCollector(msg)
        return msg
    }

}

