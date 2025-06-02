import { SlashCommand } from "@/structures/commands/SlashCommand.js"
import { createEmptyEmbed } from "@/utils/tools.js"


export default new SlashCommand()
    .setName("clear")
    .setDescription("Limpia la lista de reproducción")
    .setCategory("Music")
    .setExecute(async (client, interaction) => {
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

        player.queue.remove(player.queue.tracks).then(async () => {
            await interaction.followUp({
                embeds: [
                    createEmptyEmbed()
                        .setDescription("🧹💨 Se borro la lista de reprodución")
                ]
            })
        })

    })

