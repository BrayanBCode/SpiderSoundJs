import { EmbedBuilder } from "discord.js";
import { inspect } from "util";
import { notifyDev } from "../../client/devNotifier.js";

/** Texto legible de cualquier cosa lanzada (Error, objeto o valor suelto) */
export function errorText(error: unknown): string {
    if (error instanceof Error) return error.stack || error.message;
    if (typeof error === "object" && error !== null) return inspect(error, { depth: 5 });
    return String(error);
}

/** Avisa al dev de un error no controlado; el mismo error no se repite antes de un minuto */
export function notifyError(title: string, text: string) {
    return notifyDev(new EmbedBuilder()
        .setTitle(`⚠️ ${title}`)
        .setColor("Red")
        .setDescription(`\`\`\`\n${text.slice(0, 3900)}\n\`\`\``),
        `${title}:${text.split("\n")[0]}`);
}
