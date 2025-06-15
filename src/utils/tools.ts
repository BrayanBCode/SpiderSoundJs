import { EmbedBuilder, EmbedData, InteractionResponse, Message, MessageFlags } from "discord.js";

import logger from "../bot/logger.js";
import { ISimpleEmbedReply } from "../types/interface/ISimpleEmbedReply.js";


/**
 * Crea un embed vacío/custom usando las opciones proporcionadas.
 *
 * @param {EmbedData} [opt] - Datos opcionales para inicializar el embed.
 * @returns {EmbedBuilder} Una nueva instancia de EmbedBuilder con las opciones proporcionadas.
 */
export function createEmptyEmbed(opt?: EmbedData) {
    return new EmbedBuilder({ ...opt })
}

/**
 * Envía una respuesta a una interacción con un embed y configuraciones opcionales.
 * 
 * Esta función simplifica respuestas comunes a comandos de slash usando un embed. 
 * Puede ser utilizada junto con {@link createEmptyEmbed} para generar respuestas rápidas.
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
 *   embed: createEmptyEmbed({ description: "No se encontraron resultados." }).setColor("Yellow"),
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


export function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
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
                logger.info(`[deleteAfterTimer] Eliminando el mensaje "${message.id}"`);
                await message.delete().catch(() => { });
            } else {
                logger.warn(`[deleteAfterTimer] No se pudo eliminar el mensaje "${message.id}"`);
            }
        } catch (err) {
            logger.error(`[deleteAfterTimer] ${err}`);
        }
    }, ms);
}

export function titleCleaner(title: string, artist?: string): string {
    // 1. Eliminar nombre del artista (ignorando mayúsculas/minúsculas, y espacios extras)
    if (artist) {
        const escapedArtist = artist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escapamos el nombre
        const artistRegex = new RegExp(`^\\s*${escapedArtist}\\s*[-:–—]?\\s*`, 'i');
        title = title.replace(artistRegex, '');
    }

    // 2. Eliminar etiquetas decorativas entre paréntesis o corchetes
    title = title.replace(/[\[\(][^)\]]*(official|video|lyric|audio|HD|4K|Visualizer|Remastered)[^)\]]*[\]\)]/gi, '');

    // 3. Quitar otros posibles decoradores al final
    title = title.replace(/\s*[\[\(][^)\]]*[\]\)]\s*$/, '');

    // 4. Espacios extra
    return title.replace(/\s{2,}/g, ' ').trim();
}

export function stringPathToSegmentedString(path: string) {
    return path.split('/')
}