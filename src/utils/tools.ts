import { EmbedBuilder, EmbedData, InteractionResponse, Message, MessageFlags } from "discord.js";
import { ISimpleEmbedReply } from "../interface/ISimpleEmbedReply.js";
import logger from "../class/logger.js";

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
 * Se utiliza para agilizar el envío de respuestas simples y monotonas, suele ser utilizado en conjunto con {@link createEmptyEmbed}.
 * 
 * 
 * @param {ISimpleEmbedReply} params - Los parámetros para la respuesta.
 * @param {Interaction} params.interaction - La interacción a la que se responde.
 * @param {Embed} [params.embed] - El embed a incluir en la respuesta.
 * @param {boolean} [params.ephemeral=false] - Si la respuesta debe ser efímera (solo visible para el usuario).
 * @param {Object} [params.options] - Opciones adicionales para la respuesta.
 *
 * @returns {Promise<Message>} El mensaje que fue enviado como respuesta.
 * 
 * @example
 * simpleEmbedReply(
    interaction: inter,
    embed: createEmptyEmbed({ description: "No se encontraron resultados" }).setColor("Yellow"),
    ephemeral: true
    })
 */
export async function simpleEmbedReply({ interaction, embed, ephemeral = false, options }: ISimpleEmbedReply): Promise<InteractionResponse<true>> {
    if (options) {
        return await interaction.reply({ ...options });
    } else {
        return await interaction.reply({
            embeds: embed ? [embed] : [],
            flags: ephemeral ? MessageFlags.Ephemeral : undefined
        });
    }
}


export function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

export function deleteAfterTimer(msg: Message | InteractionResponse<true>, ms: number): NodeJS.Timeout {
    return setTimeout(async () => {
        try {
            const fetched = await msg.fetch();
            if (fetched.deletable) {
                logger.info(`[deleteAfterTimer] Eliminando el mensaje "${fetched.id}"`)
                return await fetched.delete();
            }
            logger.warn(`[deleteAfterTimer] No se pudo eliminar el mensaje "${fetched.id}"`)

        } catch (err) {
            logger.error(`[deleteAfterTimer] ${err}`);

        }
    }, ms);
}

export function titleCleaner(title: string, artist: string): string {
    // 1. Eliminar nombre del artista (ignorando mayúsculas/minúsculas, y espacios extras)
    const escapedArtist = artist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escapamos el nombre
    const artistRegex = new RegExp(`^\\s*${escapedArtist}\\s*[-:–—]?\\s*`, 'i');
    title = title.replace(artistRegex, '');

    // 2. Eliminar etiquetas decorativas entre paréntesis o corchetes
    title = title.replace(/[\[\(][^)\]]*(official|video|lyric|audio|HD|4K|Visualizer|Remastered)[^)\]]*[\]\)]/gi, '');

    // 3. Quitar otros posibles decoradores al final
    title = title.replace(/\s*[\[\(][^)\]]*[\]\)]\s*$/, '');

    // 4. Espacios extra
    return title.replace(/\s{2,}/g, ' ').trim();
}