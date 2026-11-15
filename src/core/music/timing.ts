// Cálculos de tiempo del reproductor, sin Discord ni Lavalink de por medio (se prueban en timing.test.ts)

/** Lo mínimo de una canción para calcular tiempos (sirve con los Track de moonlink.js) */
export interface TimedTrack {
    duration: number;
    position?: number;
    isStream?: boolean;
}

export type LoopMode = "off" | "track" | "queue" | string;

const LOOP_LABELS: Record<string, string> = { off: "Apagada", track: "Canción", queue: "Cola" };

/** Nombre en español del modo de repetición */
export const loopLabel = (loop: LoopMode) => LOOP_LABELS[loop] ?? loop;

/** Cuánto le falta a la canción, en ms. `undefined` si es una transmisión en vivo */
export function remainingMs(track: TimedTrack): number | undefined {
    if (track.isStream) return undefined;
    return Math.max(0, track.duration - (track.position ?? 0));
}

/** Suma de duraciones, sin contar transmisiones en vivo */
export const totalDuration = (tracks: readonly TimedTrack[]) =>
    tracks.reduce((sum, t) => sum + (t.isStream ? 0 : t.duration), 0);

/**
 * En cuántos ms empieza la canción que está en `index` de la cola (0 = la siguiente),
 * contando lo que le falta a la actual. `undefined` si algo del medio es en vivo (no tiene fin).
 */
export function startsInMs(current: TimedTrack | null | undefined, queue: readonly TimedTrack[], index: number): number | undefined {
    const ahead = queue.slice(0, index);
    if (ahead.some(t => t.isStream)) return undefined;
    const left = current ? remainingMs(current) : 0;
    if (left === undefined) return undefined;
    return left + totalDuration(ahead);
}

/** Marca de Discord `<t:…:R>` ("en 3 minutos"), que cada cliente actualiza solo sin editar el mensaje */
export const discordRelative = (msFromNow: number, now = Date.now()) => `<t:${Math.floor((now + msFromNow) / 1000)}:R>`;
