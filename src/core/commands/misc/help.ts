import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { createEmptyEmbed } from "@/utils/tools.js";


export default new SlashCommand()
    .setName("help")
    .setDescription("Te dice trola")
    .setCategory("Misc")
    .setExecute(async (_client, interaction) => {
        await interaction.reply({
            embeds: [
                createEmptyEmbed()
                    .setDescription("❌ Sin implementar")
                    .setColor("Red")]
        })

    })