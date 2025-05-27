import { SlashCommand } from "@/structures/commands/SlashCommand.js"


export default new SlashCommand()
    .setName("ping")
    .setDescription("Responde Pong!")
    .setCategory("Misc")

    .setExecute(
        async (client, interaction) => {
            interaction.reply("Pong! " + client.user?.username)
        })

