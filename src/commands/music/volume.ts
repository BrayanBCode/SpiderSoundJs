import { CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";

export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("volume")
            .setDescription("Ajusta el volumen de reprdución")
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

        const player = client.Tools.getPlayer(interaction.guildId)

        if (!player) return await interaction.reply({
            embeds: [
                client.Tools.createEmbedTemplate()
                    .setDescription("No hay un reproductor para este servidor, utiliza /play para crearlo")
            ]
        })

        const src = (interaction.options as CommandInteractionOptionResolver).getNumber("volume") as number;

        const afterVolume = player
        await player.setVolume(src)

        await interaction.reply({
            embeds: [
                client.Tools.createEmbedTemplate()
                    .setAuthor({ name: "Se cambio el volumen" })
                    .addFields({ name: "Antes", value: `${afterVolume}`, inline: false }, { name: "Ahora", value: `${player.volume}`, inline: false })
                    .setFooter({
                        text: `Pedido por ${interaction.user.displayName}`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
            ]
        })

    }
})