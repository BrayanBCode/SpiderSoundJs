import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";
import { createEmptyEmbed } from "../../utils/tools.js";

export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("help")
            .setDescription("Te dice trola"),

        category: "Misc",

    },
    execute: async (client, interaction) => {
        await interaction.reply({ embeds: [createEmptyEmbed().setDescription("❌ Sin implementar").setColor("Red")] })
    }
})