import { ApplicationCommandOptionType, MessageFlags } from "discord.js";
import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import logger from "../../../core/client/logger.js";
import { EmptyEmbed } from "../../../utils/messages.js";

const CATEGORY_TITLES: Record<string, string> = { Music: "🎵 Música", Misc: "✨ Otros" };

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

            const sections = [...byCategory].map(([category, lines]) => `### ${CATEGORY_TITLES[category] ?? category}\n${lines.join("\n")}`);
            const embed = EmptyEmbed()
                .setAuthor({ name: "Comandos de Araña Sound 🕷️", iconURL: client.user?.displayAvatarURL() })
                .setDescription(sections.join("\n"))
                .setColor(0x1DB954)
                .setFooter({ text: "También podés usar los botones del mensaje del reproductor." });

            return inter.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (err) {
            logger.error(`[/help] Error no controlado en el comando:`, err);
        }
    })
