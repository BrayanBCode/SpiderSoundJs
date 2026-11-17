import { ApplicationCommandOptionType, MessageFlags } from "discord.js";
import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import logger from "../../../core/client/logger.js";
import { EmptyEmbed } from "../../../utils/messages.js";
import { packLines } from "../../../utils/tools.js";

/** Secciones en el orden en que se muestran (las mismas que la página de comandos de la web) */
const SECTIONS: { title: string; commands: string[] }[] = [
    { title: "▶️ Reproducción", commands: ["play", "playnext", "forceplay", "pause", "resume", "stop"] },
    { title: "📃 Cola", commands: ["queue", "skip", "move", "remove", "shuffle", "clear"] },
    { title: "🎛️ Control", commands: ["loop", "forward", "backward"] },
    { title: "❤️ Favoritos y playlists", commands: ["favoritos", "playlist"] },
];
/** Un comando nuevo que no está en ninguna sección aparece igual, acá */
const OTHERS_TITLE = "✨ Otros";
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
            // Se arma con los comandos cargados (descripción incluida): solo el orden y las secciones están acá
            const loaded = client.slashCommands;
            const placed = new Set(SECTIONS.flatMap(s => s.commands));
            const others = [...loaded.values()].filter(cmd => !placed.has(cmd.name)).sort((a, b) => a.name.localeCompare(b.name));

            const sections = [
                ...SECTIONS.map(s => ({ title: s.title, cmds: s.commands.flatMap(name => loaded.get(name) ?? []) })),
                { title: OTHERS_TITLE, cmds: others },
            ].filter(s => s.cmds.length);

            const lines = sections.flatMap(s => [`### ${s.title}`, ...s.cmds.flatMap(commandLines)]);

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
