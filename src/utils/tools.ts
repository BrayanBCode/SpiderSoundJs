// Funciones puras de formato y colecciones, sin dependencias de Discord ni de moonlink.

export function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

export function titleCleaner(title: string, artist?: string): string {
    // 1. Eliminar nombre del artista (ignorando mayúsculas/minúsculas, y espacios extras)
    if (artist) {
        const escapedArtist = artist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escapamos el nombre
        const artistRegex = new RegExp(`^\\s*${escapedArtist}\\s*[-:–—,]?\\s*`, 'i');
        title = title.replace(artistRegex, '');
    }

    // 🔹 1.5. Eliminar coma, guiones o separadores sobrantes al inicio
    title = title.replace(/^[\s,;:–—-]+/, '');

    // 2. Eliminar etiquetas decorativas entre paréntesis o corchetes
    title = title.replace(
        /[\[\(][^)\]]*(official|video|lyric|audio|HD|4K|Visualizer|Remastered)[^)\]]*[\]\)]/gi,
        ''
    );

    // 3. Eliminar múltiples espacios, guiones duplicados o comas extra
    title = title.replace(/\s{2,}/g, ' ').trim();
    title = title.replace(/^[,\s-]+|[,\s-]+$/g, '').trim();

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
