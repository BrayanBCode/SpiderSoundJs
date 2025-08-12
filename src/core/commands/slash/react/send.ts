import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { MessageFlags } from "discord.js";


// send message with reaction + role
export default new SlashCommand()
    .setName("send")
    .setDescription("Send a message with a reaction.")
    .setExecute(async (client, interaction) => {
        if (!interaction.guildId) return;

        await interaction.reply({
            content: "En desarrollo...",
            flags: MessageFlags.Ephemeral
        });
    })
    .addStringOption(option =>
        option.setName("message")
            .setDescription("The message to send")
            .setRequired(true))
    .addStringOption(option =>
        option.setName("emoji")
            .setDescription("The emoji to react with")
            .setRequired(true))
    .addRoleOption(option =>
        option.setName("role")
            .setDescription("The role to assign when the reaction is added")
            .setRequired(true));
