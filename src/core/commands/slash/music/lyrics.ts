import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { MessageFlags } from "discord.js";

export default new SlashCommand()
    .setName("lyrics")
    .setDescription("Get the lyrics of a song.")
    .setExecute(async (client, interaction) => {
        if (!interaction.guildId) return;

        await interaction.reply({
            content: "En desarrollo...",
            flags: MessageFlags.Ephemeral
        });
    })