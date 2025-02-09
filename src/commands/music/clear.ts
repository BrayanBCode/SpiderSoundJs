import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";

export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("clear")
            .setDescription("Limpia la lista de reprodución"),

        category: "Music"
    },
    execute: async (client, interaction) => {
        if (!interaction.guildId) return

        await interaction.deferReply()

        const player = client.Tools.getPlayer(interaction.guildId)

        const ErrMessage = client.Tools.createEmbedTemplate()
            .setDescription("La lista ya esta vacia. Utiliza /play para escuchar nuevamente")

        if (!player) return await interaction.followUp({
            embeds: [
                ErrMessage
            ]
        })

        player.queue.splice(0, player.queue.tracks.length + 1)

        await interaction.followUp({
            embeds: [
                client.Tools.createEmbedTemplate()
                    .setDescription("🧹💨 Se borro la lista de reprodución")
            ]
        })

    }

})