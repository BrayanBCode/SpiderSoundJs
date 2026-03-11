import { EmbedBuilder, InteractionResponse, Message, MessageFlags, type EmbedData } from "discord.js";
import logger from "./logger";
import type { ISimpleEmbedReply } from "../music/strategy/PlayBackStrategy.messages";


/**
 * Crea un embed vacío/custom usando las opciones proporcionadas.
 *
 * @param {EmbedData} [opt] - Datos opcionales para inicializar el embed.
 * @returns {EmbedBuilder} Una nueva instancia de EmbedBuilder con las opciones proporcionadas.
 */
export function createEmptyEmbed(opt?: EmbedData) {
    return new EmbedBuilder({ ...opt })
}
export function EmptyEmbed(opt?: EmbedData) {
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
    // 1. Eliminar el nombre del artista (ignora mayúsculas, espacios y separadores comunes)
    if (artist) {
        // Escapamos caracteres especiales del nombre del artista para el regex
        const escapedArtist = artist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Elimina al artista si está al inicio, seguido o no de coma, guion, "y", "&", etc.
        const artistRegex = new RegExp(
            `^\\s*(${escapedArtist}\\s*(?:,|&|y)?\\s*)+[-:–—,]?\\s*`,
            'i'
        );

        title = title.replace(artistRegex, '');
    }

    // 2. Eliminar separadores sobrantes al principio (por si quedaron comas, guiones o espacios)
    title = title.replace(/^[\s,;:–—-]+/, '');

    // 3. Eliminar etiquetas decorativas o redundantes entre paréntesis o corchetes
    title = title.replace(
        /[\[\(][^)\]]*(official|video|lyric|audio|hd|4k|visualizer|remastered|prod\.?|ft\.?|feat\.?)[^)\]]*[\]\)]/gi,
        ''
    );

    // 4. Limpiar múltiples espacios, guiones o comas repetidas
    title = title
        .replace(/\s{2,}/g, ' ') // espacios dobles
        .replace(/\s*([,;:–—-])\s*/g, ' $1 ') // separadores con espacios consistentes
        .replace(/^[,\s-]+|[,\s-]+$/g, '') // bordes
        .trim();

    return title;
}


export function stringPathToSegmentedString(path: string) {
    return path.split('/')
}

export function formatMS_HHMMSS(num: number) {
    return [86400000, 3600000, 60000, 1000, 1].reduce((p: number[], c: number) => {
        let res = ~~(num / c);
        num -= res * c;
        return [...p, res];
    }, [])
        .map((v, i) => i <= 1 && v === 0 ? undefined : [i === 4 ? "." : "", v < 10 ? `0${v}` : v, [" Days, ", ":", ":", "", ""][i]].join(""))
        .filter(Boolean)
        .slice(0, -1)
        .join("");
}

export const delay = async (ms: any) => new Promise(r => setTimeout(() => r(true), ms));

export function getSurrounding<T>(list: T[], position: number, range: number = 5): T[] {
    if (position < 0 || position >= list.length) {
        throw new Error("La posición está fuera del rango de la lista");
    }

    const start = Math.max(0, position - range);
    const end = Math.min(list.length, position + range + 1); // +1 porque slice no incluye el final

    return list.slice(start, end);
}

/**
 * Extrae la marca de tiempo (en segundos) de un URL de YouTube.
 * Soporta:
 *  - ?t=762
 *  - &t=1m2s
 *  - ?start=120
 *  - fragmentos #t=3m10s o #t=190
 *  - youtu.be/...?...#t=...
 *
 * Retorna número de segundos o null si no hay timestamp.
 */
export function extractYouTubeTimestamp(urlString: string): number | null {
    try {
        // Aseguramos que la URL tenga un esquema para que el constructor URL no falle
        const maybeUrl = urlString.startsWith("http") ? urlString : "https://" + urlString;
        const url = new URL(maybeUrl);

        // 1) revisar search params comunes: t, start
        const searchParams = url.searchParams;
        const tParam = searchParams.get("t");
        const startParam = searchParams.get("start");

        const fragment = url.hash ? url.hash.substring(1) : ""; // sin '#'

        // helper: convierte "1h2m3s" o "2m3s" o "190" a segundos
        function parseTimeToSeconds(time: string): number | null {
            if (!time) return null;
            // si es solo dígitos -> segundos directos (ej "762")
            if (/^\d+$/.test(time)) return parseInt(time, 10);

            // formato combinado (1h2m3s)
            const re = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i;
            const m = time.match(re);
            if (!m) return null;

            const hours = m[1] ? parseInt(m[1], 10) : 0;
            const minutes = m[2] ? parseInt(m[2], 10) : 0;
            const seconds = m[3] ? parseInt(m[3], 10) : 0;
            const total = hours * 3600 + minutes * 60 + seconds;
            return total > 0 ? total : null;
        }

        // prefer 't' si existe
        if (tParam) {
            const parsed = parseTimeToSeconds(tParam);
            if (parsed !== null) return parsed;
        }

        if (startParam) {
            const parsed = parseTimeToSeconds(startParam);
            if (parsed !== null) return parsed;
        }

        // también revisar fragmentos: puede venir como "t=1m2s" o "1m2s"
        // buscar t=... en fragmento
        const fragTMatch = fragment.match(/(?:^|&)t=([^&]+)/);

        if (fragTMatch) {
            const parsed = parseTimeToSeconds(fragTMatch[1]!);
            if (parsed !== null) return parsed;
        }

        // si hash es solo "1m2s" o "190"
        if (fragment) {
            const parsed = parseTimeToSeconds(fragment);
            if (parsed !== null) return parsed;
        }

        return null;
    } catch (e) {
        return null;
    }
}
