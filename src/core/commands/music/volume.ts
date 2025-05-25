import { Command } from "@/structures/commands/Commands.js";
import { createEmptyEmbed } from "@/utils/tools.js";
import { SlashCommandBuilder, CommandInteractionOptionResolver } from "discord.js";


export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("volume")
            .setDescription("Ajusta el volumen de reproducción")
            .addIntegerOption(o => o
                .setName("vol")
                .setDescription("Volumen entre 1 y 100")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
            ),
        category: 'Music'
    },
    execute: async (client, interaction) => {
        if (!interaction.guildId) return;

        const player = client.getPlayer(interaction.guildId);

        if (!player) {
            return await interaction.reply({
                embeds: [
                    createEmptyEmbed()
                        .setDescription("No hay un reproductor para este servidor, utiliza /play para crearlo")
                ]
            });
        }

        const vol = (interaction.options as CommandInteractionOptionResolver).getInteger("vol") as number;
        const beforeVolume = player.volume;

        player.setVolume(vol, true);

        const PrevGreatThanCurrent = beforeVolume > player.volume

        await interaction.reply({
            embeds: [
                createEmptyEmbed()
                    .setAuthor({ name: "🔊 Se cambió el volumen" })
                    .addFields(
                        { name: `${PrevGreatThanCurrent ? "🔉" : "🔊"} Antes`, value: `\`${beforeVolume}\``, inline: true },
                        { name: `${PrevGreatThanCurrent ? "🔊" : "🔉"} Ahora`, value: `\`${player.volume}\``, inline: true }
                    )
                    .setFooter({
                        text: `Pedido por ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
            ]
        });
    }
});
