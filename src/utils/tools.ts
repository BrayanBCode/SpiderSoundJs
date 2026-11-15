// Funciones puras de formato y colecciones, sin dependencias de Discord ni de moonlink.

export function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

/** Junta líneas en textos de hasta `max` caracteres (unidas con "\n") sin cortar ninguna, salvo que una sola ya se pase */
export function packLines(lines: readonly string[], max: number): string[] {
    const chunks: string[] = [];
    let current = "";
    for (const raw of lines) {
        const line = raw.slice(0, max);
        if (current && current.length + 1 + line.length > max) {
            chunks.push(current);
            current = "";
        }
        current = current ? `${current}\n${line}` : line;
    }
    if (current) chunks.push(current);
    return chunks;
}

/** Devuelve `true` la primera vez que se pide una clave y `false` hasta que pasen `ms` desde la última vez que dio `true` */
export function createCooldown(ms: number) {
    const last = new Map<string, number>();
    return (key: string, now = Date.now()) => {
        const prev = last.get(key);
        if (prev !== undefined && now - prev < ms) return false;
        last.set(key, now);
        return true;
    };
}

/** Copia mezclada al azar (Fisher-Yates); no modifica el original */
export function shuffle<T>(arr: readonly T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// Palabras que solo describen el video, no la canción. Se buscan como palabras enteras (no "hd" dentro de "Childhood").
const NOISE_WORDS = "official|oficial|officiel|video|vídeo|videoclip|clip|lyrics?|letra|audio|visuali[sz]er|hd|hq|4k|remaster(?:ed)?|mv"
const NOISE = new RegExp(String.raw`(?<![\p{L}\p{N}])(?:${NOISE_WORDS})(?![\p{L}\p{N}])`, "iu")
const NOISE_ALL = new RegExp(NOISE.source, "giu")
// "official video HD" sin paréntesis, como en "Papa Roach - Last Resort official video HD"
const LOOSE_OFFICIAL = /\s*\b(?:official|oficial)(?:\s+(?:music|lyric))?\s+(?:video|audio|visuali[sz]er)(?:\s+(?:hd|hq|4k))*\b/gi
// Grupos entre ( ), [ ] o 【 】 sin anidar
const BRACKETS = /[(\[【]([^()\[\]【】]*)[)\]】]/gu
// Separadores " - ", " – ", " — " (o "Artista- Canción"); no corta "Jay-Z" ni "t.A.T.u."
const DASH = /\s*[-–—]\s+|\s+[-–—]\s*/
// Separa los nombres de una colaboración: "A, B & C feat. D"
const ARTIST_LIST = /\s*(?:,|&|\+|\s(?:feat\.?|ft\.?|featuring|x|y|and|with)\s)\s*/i

/** Minúsculas, sin tildes ni símbolos ni espacios: "Joaquín Levinton" y "JoaquinLevinton" quedan iguales */
const normalize = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")

/** Lo que solo tiene palabras de ruido ("Letra", "Official Video") */
const isNoiseOnly = (text: string) => normalize(text.replace(NOISE_ALL, "")) === ""

/**
 * Quita del título lo que ya se muestra aparte (el artista) y las etiquetas del video
 * ("Official Music Video", "Letra", "4K"...). Si la limpieza dejara el título vacío, devuelve el original.
 *
 * Ejemplos:
 * - "Avril Lavigne - Complicated (Official Video)" → "Complicated"
 * - "Bleed It Out (Official Music Video) [4K Upgrade] - Linkin Park" → "Bleed It Out"
 * - "Cactus | Nasa Histoires | Letra" → "Cactus"
 */
export function titleCleaner(title: string, artist?: string): string {
    const original = title.trim()
    // En YouTube el "artista" es el canal: "Linkin Park - Topic", "AvrilLavigneVEVO"
    const artistKey = normalize((artist ?? "").replace(/\s*-\s*topic$/i, "").replace(/vevo$/i, ""))
    const isArtist = (text: string) =>
        artistKey.length >= 2 && text.split(ARTIST_LIST).some(name => normalize(name) === artistKey)

    // 1. Grupos entre paréntesis o corchetes que son ruido o solo el artista ("(Letra)", "【Ado】")
    let clean = original.replace(BRACKETS, (group, inner: string) => NOISE.test(inner) || isArtist(inner) ? " " : group)
    clean = clean.replace(LOOSE_OFFICIAL, " ")

    // 2. Partes separadas por " | ": se descartan las de ruido o del artista
    const pipeParts = clean.split(/\s+\|\s+/)
    if (pipeParts.length > 1) {
        const kept = pipeParts.filter(part => !isNoiseOnly(part) && !isArtist(part))
        clean = (kept.length ? kept : pipeParts.slice(0, 1)).join(" | ")
    }

    // 3. "Artista - Canción" o "Canción - Artista": se quita el lado del artista
    const dashParts = clean.split(DASH)
    if (dashParts.length > 1) {
        if (isArtist(dashParts[0])) dashParts.shift()
        else if (isArtist(dashParts[dashParts.length - 1])) dashParts.pop()
        clean = dashParts.join(" - ")
    }

    // 4. Espacios dobles y separadores sueltos en los bordes
    clean = clean.replace(/\s{2,}/g, " ").replace(/^[\s\-–—|:,;]+|[\s\-–—|:,;]+$/g, "")

    return clean || original
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
