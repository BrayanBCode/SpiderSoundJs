
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { MessageFlags, PermissionFlagsBits } from "discord.js";

export default new SlashCommand()
    .setName("mute")
    .setDescription("Mute a user in the server.")
    .setExecute(async (client, interaction) => {
        if (!interaction.guildId) return;

        await interaction.reply({
            content: "En desarrollo...",
            flags: MessageFlags.Ephemeral
        });
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
    .addUserOption(option =>
        option.setName("user")
            .setDescription("The user to mute")
            .setRequired(true))
    .addStringOption(option =>
        option.setName("reason")
            .setDescription("The reason for the mute")
            .setRequired(false));

