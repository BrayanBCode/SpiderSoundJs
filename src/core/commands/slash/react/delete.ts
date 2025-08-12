import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { MessageFlags } from "discord.js";

export default new SlashCommand()
    .setName("delete")
    .setDescription("Delete a reaction from a message.")
    .setExecute(async (client, interaction) => {
        if (!interaction.guildId) return;

        await interaction.reply({
            content: "En desarrollo...",
            flags: MessageFlags.Ephemeral
        });
    })
    .addStringOption(option =>
        option.setName("message_id")
            .setDescription("The ID of the message to remove the reaction from")
            .setRequired(true))
    .addStringOption(option =>
        option.setName("emoji")
            .setDescription("The emoji to remove")
            .setRequired(true));