import { Command } from "@/structures/commands/Commands.js";
import { createEmptyEmbed } from "@/utils/tools.js";
import { SlashCommandBuilder } from "discord.js";


export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("help")
            .setDescription("Te dice trola"),

        category: "Misc",

    },
    execute: async (_client, interaction) => {
        await interaction.reply({ embeds: [createEmptyEmbed().setDescription("❌ Sin implementar").setColor("Red")] })
    }
})