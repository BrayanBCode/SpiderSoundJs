import { Command } from "@/structures/commands/Commands.js"
import { createEmptyEmbed } from "@/utils/tools.js"
import { SlashCommandBuilder } from "discord.js"


export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("clear")
            .setDescription("Limpia la lista de reproducción"),

        category: "Music"
    },
    execute: async (client, interaction) => {
        if (!interaction.guildId) return

        await interaction.deferReply()

        const player = client.getPlayer(interaction.guildId)

        const ErrMessage = createEmptyEmbed()
            .setDescription("La lista ya esta vacia. Utiliza /play para escuchar nuevamente")

        if (!player) return await interaction.followUp({
            embeds: [
                ErrMessage
            ]
        })

        player.queue.utils.destroy().then(async () => {
            await interaction.followUp({
                embeds: [
                    createEmptyEmbed()
                        .setDescription("🧹💨 Se borro la lista de reprodución")
                ]
            })
        })

    }

})