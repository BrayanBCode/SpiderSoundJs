import { APIMessageComponentEmoji } from "discord.js";

/**
 * Emojis propios de la app (Developer Portal → Emojis). Los diseños fuente están en assets/emojis.
 * Si se vuelven a subir, cambian los IDs y hay que actualizarlos acá.
 */
export const PLAYER_EMOJIS = {
    queue: { id: "1570681613493207070", name: "queue" },
    prev: { id: "1570681611949711441", name: "prev" },
    playpause: { id: "1570681609454100490", name: "playpause" },
    next: { id: "1570681607868784700", name: "next" },
    favorite: { id: "1570681600797057157", name: "favorite" },
    loop: { id: "1570681606056845312", name: "loop" },
    back10: { id: "1570681598993637398", name: "back10" },
    stop: { id: "1570681617159168010", name: "stop" },
    fwd15: { id: "1570681603787726858", name: "fwd15" },
    shuffle: { id: "1570681615183511642", name: "shuffle" },
} satisfies Record<string, APIMessageComponentEmoji>;
