import { Command } from "@/structures/commands/Commands.js"
import { SlashCommandBuilder } from "discord.js"


export default new Command(
    {
        data: {
            command: new SlashCommandBuilder()
                .setName("ping")
                .setDescription("Responde Pong!"),

            category: 'Misc'
        },
        execute: (client, interaction) => {
            interaction.reply("Pong! " + client.user?.username)
        }
    }
)
