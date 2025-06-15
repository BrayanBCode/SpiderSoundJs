import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import https from "https";
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { config } from "@/config/config.js";
import logger from "@/bot/logger.js";

export default new SlashCommand()
    .setName("dev")
    .setDescription("Comandos exclusivos para el Developer..")
    .setExecute(
        async (_client, interaction) => {
            if (!interaction.guildId) return;


            if (![config.dev.id].includes(interaction.user.id)) {
                return await interaction.reply({
                    content: "Debes ser el Developer del bot para utilizar esta sección de comandos.",
                    flags: MessageFlags.Ephemeral
                });
            }

            const group = interaction.options.getSubcommandGroup(true);
            const subCmd = interaction.options.getSubcommand(true);

            if (group !== "minecraft" && group !== "general") {
                return await interaction.reply({
                    content: "Grupo de comandos inválido. Por favor, utiliza `/dev minecraft` o `/dev general`.",
                    flags: MessageFlags.Ephemeral
                });
            }

            switch (group) {
                case "general":
                    if (subCmd === "test") {
                        await interaction.reply({
                            content: "Comando de prueba ejecutado correctamente.",
                            flags: MessageFlags.Ephemeral
                        });
                    } else {
                        await interaction.reply({
                            content: "Comando no reconocido en el grupo general.",
                            flags: MessageFlags.Ephemeral
                        });
                    }
                    return;


            }
        }
    )
    .addSubcommandGroup(g =>
        g
            .setName("general")
            .setDescription("Comandos generales para el Developer")
            .addSubcommand(s =>
                s.setName("test")
                    .setDescription("Comando de prueba para el Developer.")
            )
    )



//   async execute(inter: ChatInputCommandInteraction) {
//     const emojis = inter.guild?.emojis.cache;

//     if (!emojis || emojis.size === 0) {
//       return inter.reply("❌ No hay emojis personalizados en este servidor.");
//     }

//     const emojiList = emojis.map(e =>
//       `${e.animated ? "<a:" : "<:"}${e.name}:${e.id}> → \`${e.name}\` - \`${e.id}\``
//     ).join("\n");

//     const embed = new EmbedBuilder()
//       .setTitle("📙 Emojis del servidor")
//       .setDescription(emojiList.slice(0, 4000)) // Discord tiene límite de 4096 caracteres
//       .setColor("Blurple");

//     return inter.reply({ embeds: [embed], ephemeral: true });
//   }