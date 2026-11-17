// Texto de la cola (/queue y botón 📜), sin Discord de por medio: se prueba en queueView.test.ts
import { formatMS_HHMMSS, titleCleaner } from "../../utils/tools.js";
import { loopLabel, totalDuration, type LoopMode, type TimedTrack } from "./timing.js";

export interface QueueTrack extends TimedTrack {
    title: string;
    author: string;
    uri?: string | null;
}

export interface QueueState {
    current?: QueueTrack | null;
    tracks: readonly QueueTrack[];
    loop: LoopMode;
}

export const QUEUE_PAGE_SIZE = 10;
// Una línea por canción en el ancho de un embed (~55 caracteres): título y artista se cortan para no partirse en dos
const TITLE_MAX = 32;
const AUTHOR_MAX = 18;
/** La línea de "Sonando" ya lleva el prefijo y el tiempo: el título entra más corto */
const CURRENT_TITLE_MAX = 24;

const code = (text: string) => `\`${text}\``;
const cut = (text: string, max: number) => text.length > max ? `${text.slice(0, max - 1)}…` : text;

/** Título limpio, cortado y con enlace (si es un enlace normal: los corchetes rompen el formato de Discord) */
function linkedTitle(track: QueueTrack, max = TITLE_MAX) {
    const title = cut(titleCleaner(track.title, track.author) || track.title || "Sin título", max).replace(/[[\]]/g, "");
    return track.uri && /^https?:\/\/\S+$/.test(track.uri) ? `[${title}](${track.uri})` : `**${title}**`;
}

const durationLabel = (track: QueueTrack) => track.isStream ? "En vivo" : formatMS_HHMMSS(track.duration);

export const queuePageCount = (state: QueueState, pageSize = QUEUE_PAGE_SIZE) =>
    Math.max(1, Math.ceil(state.tracks.length / pageSize));

/** Una página de la cola: lo que suena, las canciones de la página y el pie con el total */
export function queuePage(state: QueueState, page: number, pageSize = QUEUE_PAGE_SIZE) {
    const pages = queuePageCount(state, pageSize);
    const index = Math.min(Math.max(page, 0), pages - 1);
    const start = index * pageSize;

    const lines: string[] = [];
    const current = state.current;
    if (current) {
        const time = current.isStream ? "En vivo" : `${formatMS_HHMMSS(current.position ?? 0)} / ${formatMS_HHMMSS(current.duration)}`;
        lines.push(`▶ **Sonando:** ${linkedTitle(current, CURRENT_TITLE_MAX)} · ${cut(current.author || "Desconocido", AUTHOR_MAX)} ${code(time)}`, "");
    }

    const slice = state.tracks.slice(start, start + pageSize);
    if (slice.length) {
        lines.push(...slice.map((track, i) =>
            `${code(`${start + i + 1}.`)} ${linkedTitle(track)} · ${cut(track.author || "Desconocido", AUTHOR_MAX)} ${code(durationLabel(track))}`));
    } else {
        lines.push("No hay más canciones en la cola. Usá /play para agregar.");
    }

    const footer = `Página ${index + 1}/${pages} · ${state.tracks.length} en cola (${formatMS_HHMMSS(totalDuration(state.tracks))}) · Loop: ${loopLabel(state.loop)}`;

    return { index, pages, description: lines.join("\n").slice(0, 4096), footer };
}
