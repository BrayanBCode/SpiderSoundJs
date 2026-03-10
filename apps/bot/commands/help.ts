import { SlashCommand } from "@/src/Base/discord/SlashCommand";
import logger from "@/utils/logger";
import { EmbedBuilder } from "discord.js";

export default new SlashCommand()
    .setName("help")
    .setDescription("Muestra una lista de todos los comandos disponibles.")
    .setExecute(async (client, interaction) => {
        const commands = [...client.commandCol.values()];

        const embed = new EmbedBuilder()
            .setTitle("📘 Lista de Comandos")
            .setDescription("Aquí tienes todos los comandos disponibles en el bot.")
            .setColor("#42A5FF")
            .setThumbnail("https://cdn-icons-png.flaticon.com/512/854/854878.png")
            .setTimestamp()
            .setFooter({ text: `${client.user?.displayName || "Bot"} — Sistema de Ayuda` });

        for (const cmd of commands) {
            embed.addFields({
                name: `🔹 /${cmd.name}`,
                value: cmd.description ? cmd.description : "Sin descripción.",
            });
        }

        if (embed.length > 6000) {
            logger.error("[Help Command] El embed excede el límite de caracteres permitido.");

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("📘 Lista de Comandos")
                        .setDescription("La lista de comandos es demasiado larga para mostrarla aquí. Por favor, consulta la documentación oficial o el sitio web del bot para obtener más información.")
                        .setColor("#FF5252")
                        .setThumbnail("https://cdn-icons-png.flaticon.com/512/854/854878.png")
                        .setTimestamp()
                        .setFooter({ text: `${client.user?.displayName || "Bot"} — Sistema de Ayuda` })
                ],
                ephemeral: true,
            });
        }

        await interaction.reply({
            embeds: [embed],
        });
    });
