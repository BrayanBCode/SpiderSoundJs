import { ApplicationCommandOptionType, MessageFlags } from "discord.js";
import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import logger from "../../../core/client/logger.js";
import { EmptyEmbed } from "../../../utils/messages.js";
import { packLines } from "../../../utils/tools.js";

const CATEGORY_TITLES: Record<string, string> = { Music: "🎵 Música", Misc: "✨ Otros" };
const AUTHOR = "Comandos de Araña Sound 🕷️";
const FOOTER = "También podés usar los botones del mensaje del reproductor.";
const DESCRIPTION_MAX = 4096;
const MESSAGE_MAX = 6000;
/** El autor y el pie también cuentan para el límite del mensaje */
const HEADER_CHARS = AUTHOR.length + FOOTER.length;

/** Líneas "/comando sub — descripción" de un comando (una por subcomando si tiene) */
function commandLines(cmd: SlashCommand): string[] {
    const { name, description, options = [] } = cmd.toJSON();
    const subs = options.filter(o => o.type === ApplicationCommandOptionType.Subcommand);
    if (!subs.length) return [`**/${name}** — ${description}`];
    return subs.map(sub => `**/${name} ${sub.name}** — ${sub.description}`);
}

export default new SlashCommand()
    .setName("help")
    .setDescription("Muestra todos los comandos del bot.")
    .setCategory("Misc")
    .setExecute(async (client, inter) => {
        try {
            // Se arma con los comandos cargados: un comando nuevo aparece solo
            const byCategory = new Map<string, string[]>();
            const commands = [...client.slashCommands.values()].sort((a, b) => a.name.localeCompare(b.name));
            for (const cmd of commands) {
                const category = cmd.getCategory ?? "Misc";
                byCategory.set(category, [...(byCategory.get(category) ?? []), ...commandLines(cmd)]);
            }

            const lines = [...byCategory].flatMap(([category, cmdLines]) => [`### ${CATEGORY_TITLES[category] ?? category}`, ...cmdLines]);

            // Discord: 4096 caracteres por descripción y 6000 entre todos los embeds del mensaje
            const descriptions: string[] = [];
            let total = HEADER_CHARS;
            for (const text of packLines(lines, DESCRIPTION_MAX)) {
                if (total + text.length > MESSAGE_MAX) {
                    logger.warn(`[/help] La lista no entra en un mensaje: se mostraron ${descriptions.length} partes`);
                    break;
                }
                descriptions.push(text);
                total += text.length;
            }

            const embeds = descriptions.map(text => EmptyEmbed().setDescription(text).setColor(0x1DB954));
            embeds[0].setAuthor({ name: AUTHOR, iconURL: client.user?.displayAvatarURL() });
            embeds[embeds.length - 1].setFooter({ text: FOOTER });

            return inter.reply({ embeds, flags: MessageFlags.Ephemeral });
        } catch (err) {
            logger.error(`[/help] Error no controlado en el comando:`, err);
        }
    })
