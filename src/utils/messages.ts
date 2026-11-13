import { DiscordAPIError, EmbedBuilder, EmbedData, InteractionResponse, Message, MessageFlags, RESTJSONErrorCodes } from "discord.js";
import logger from "../core/client/logger.js";
import { ISimpleEmbedReply } from "../types/interface/ISimpleEmbedReply.js";

// Helpers para crear, responder y borrar mensajes de Discord.

/**
 * Elimina un mensaje sin romper si ya no existe.
 *
 * Un mensaje ya eliminado (Unknown Message, 10008) es un caso esperado y solo se registra en debug;
 * cualquier otro error (permisos, red) se registra como warn.
 *
 * @param message Mensaje a eliminar
 * @param context Prefijo para los logs, por ejemplo "PlayerMessage"
 * @returns true si se eliminó, false si ya no existía o falló
 */
export async function safeDelete(message: Message, context: string): Promise<boolean> {
    try {
        await message.delete();
        return true;
    } catch (err) {
        if (err instanceof DiscordAPIError && err.code === RESTJSONErrorCodes.UnknownMessage) {
            logger.debug(`[${context}] El mensaje ${message.id} ya estaba eliminado`);
        } else {
            logger.warn(`[${context}] No se pudo eliminar el mensaje ${message.id}: ${err}`);
        }
        return false;
    }
}

/**
 * Atajo para `new EmbedBuilder(opt)`.
 *
 * @param {EmbedData} [opt] - Datos opcionales para inicializar el embed.
 */
export function EmptyEmbed(opt?: EmbedData) {
    return new EmbedBuilder({ ...opt })
}

/**
 * Envía una respuesta a una interacción con un embed y configuraciones opcionales.
 * 
 * Esta función simplifica respuestas comunes a comandos de slash usando un embed. 
 * Puede ser utilizada junto con {@link EmptyEmbed} para generar respuestas rápidas.
 * También soporta respuestas efímeras y `followUp` cuando ya se ha respondido previamente.
 * 
 * @param {ISimpleEmbedReply} params - Parámetros para configurar la respuesta.
 * @param {Interaction} params.interaction - La interacción de Discord a la que se desea responder.
 * @param {EmbedBuilder} [params.embed] - El embed que se incluirá en la respuesta.
 * @param {boolean} [params.ephemeral=false] - Define si la respuesta será efímera (solo visible para el usuario).
 * @param {BaseMessageOptions} [params.options] - Opciones personalizadas para la respuesta (sobrescribe `embed` y `ephemeral`).
 * @param {boolean} [params.followUp] - Si la respuesta debe enviarse como un `followUp` en vez de `reply`.
 *
 * @returns {Promise<InteractionResponse<true> | Message>} El mensaje enviado como respuesta o seguimiento.
 * 
 * @example
 * await replyEmbed({
 *   interaction,
 *   embed: EmptyEmbed({ description: "No se encontraron resultados." }).setColor("Yellow"),
 *   ephemeral: true
 * });
 */
export async function replyEmbed({ interaction, embed, ephemeral = false, options, followUp }: ISimpleEmbedReply) {
    const payload = options ?? {
        embeds: embed ? [embed] : [],
        flags: ephemeral ? MessageFlags.Ephemeral : undefined
    };

    return followUp
        ? await interaction.followUp(payload)
        : await interaction.reply(payload);
}

/**
 * Elimina un mensaje automáticamente después de un tiempo especificado.
 * 
 * Esta función es útil para eliminar respuestas temporales como notificaciones,
 * advertencias, o mensajes de comandos que no deben permanecer visibles.
 * 
 * Soporta tanto mensajes comunes como respuestas a interacciones (`InteractionResponse<true>`).
 *
 * @param {Message | InteractionResponse<true>} msg - El mensaje que se desea eliminar.
 * @param {number} ms - El tiempo en milisegundos que debe esperar antes de eliminar el mensaje.
 * 
 * @returns {NodeJS.Timeout} El identificador del temporizador (`setTimeout`) que se puede usar para cancelar la operación si es necesario.
 *
 * @example
 * const msg = await interaction.reply({ content: "Esto se eliminará pronto", fetchReply: true });
 * deleteAfterTimer(msg, 5000); // elimina el mensaje después de 5 segundos
 * 
 * TODO: Reemplazar por una función más robusta que maneje mejor los errores y casos especiales.
 */
export function deleteAfterTimer(msg: Message | InteractionResponse<true>, ms: number): NodeJS.Timeout {
    return setTimeout(async () => {
        try {
            const message = typeof msg.fetch === "function" ? await msg.fetch() : msg;

            if ("deletable" in message && message.deletable) {
                await safeDelete(message, "deleteAfterTimer");
            } else {
                logger.warn(`[deleteAfterTimer] No se pudo eliminar el mensaje "${message.id}"`);
            }
        } catch (err) {
            logger.error(`[deleteAfterTimer] ${err}`);
        }
    }, ms);
}
