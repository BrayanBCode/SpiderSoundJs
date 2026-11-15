import sharp from "sharp";
import logger from "../client/logger.js";

// Portada para el mensaje "Escuchando" (experimental): Discord no deja elegir el tamaño de la imagen del embed,
// así que se arma un PNG del ancho del embed con la portada chica a la izquierda y el resto transparente.

/** Ancho máximo con que Discord muestra la imagen de un embed */
const CANVAS_WIDTH = 400;
/** Alto de la portada dentro de la imagen; el ancho sale de su proporción */
export const COVER_HEIGHT = 135;
const RADIUS = 8;
const FETCH_TIMEOUT = 5000;

export const COVER_FILE_NAME = "portada.png";

/** Portada armada a partir de una URL de imagen. `undefined` si no se pudo (el mensaje sigue sin imagen) */
export async function buildCoverImage(url: string): Promise<Buffer | undefined> {
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const resized = sharp(Buffer.from(await res.arrayBuffer()))
            .resize({ height: COVER_HEIGHT, width: CANVAS_WIDTH, fit: "inside" });
        const { data, info } = await resized.png().toBuffer({ resolveWithObject: true });

        // Esquinas redondeadas como las imágenes de Discord
        const mask = Buffer.from(`<svg width="${info.width}" height="${info.height}"><rect width="${info.width}" height="${info.height}" rx="${RADIUS}" ry="${RADIUS}"/></svg>`);
        const rounded = await sharp(data).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();

        return await sharp({ create: { width: CANVAS_WIDTH, height: info.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
            .composite([{ input: rounded, left: 0, top: 0 }])
            .png()
            .toBuffer();
    } catch (err) {
        logger.debug(`[Portada] No se pudo armar la portada de ${url}: ${err}`);
        return undefined;
    }
}
