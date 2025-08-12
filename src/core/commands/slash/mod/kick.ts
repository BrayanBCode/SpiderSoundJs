
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { MessageFlags, PermissionFlagsBits } from "discord.js";

export default new SlashCommand()
    .setName("kick")
    .setDescription("Kick a user from the server.")
    .setExecute(async (client, interaction) => {
        if (!interaction.guildId) return;

        await interaction.reply({
            content: "En desarrollo...",
            flags: MessageFlags.Ephemeral
        });
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers) // Requires no specific permissions
    .addUserOption(option =>
        option.setName("user")
            .setDescription("The user to kick")
            .setRequired(true))
    .addStringOption(option =>
        option.setName("reason")
            .setDescription("The reason for the kick")
            .setRequired(false));