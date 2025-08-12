
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { MessageFlags, PermissionFlagsBits } from "discord.js";

export default new SlashCommand()
    .setName("warn")
    .setDescription("Warn a user in the server.")
    .setExecute(async (client, interaction) => {
        if (!interaction.guildId) return;

        await interaction.reply({
            content: "En desarrollo...",
            flags: MessageFlags.Ephemeral
        });
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)