

import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { MessageFlags } from "discord.js";

export default new SlashCommand()
    .setName("add")
    .setDescription("Add a reaction to a message.")
    .setExecute(async (client, interaction) => {
        if (!interaction.guildId) return;

        await interaction.reply({
            content: "En desarrollo...",
            flags: MessageFlags.Ephemeral
        });
    })
    .addStringOption(option =>
        option.setName("message_id")
            .setDescription("The ID of the message to react to")
            .setRequired(true))
    .addStringOption(option =>
        option.setName("emoji")
            .setDescription("The emoji to react with")
            .setRequired(true))
    .addRoleOption(option =>
        option.setName("role")
            .setDescription("The role to assign when the reaction is added")
            .setRequired(true))




