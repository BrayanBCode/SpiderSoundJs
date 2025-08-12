
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { EmptyEmbed, replyEmbed } from "@/utils/tools.js";
import { PermissionFlagsBits } from "discord.js";

export default new SlashCommand()
    .setName("ban")
    .setDescription("Ban a user from the server.")
    .setExecute(async (client, interaction) => {
        if (!interaction.guildId) return

        // await replyEmbed({
        //     interaction,
        //     embed: EmptyEmbed()
        //         .setDescription(`Banning user <@${interaction.options.getUser("user")?.id}>...`)
        //         .setFooter({
        //             text: `Comando en desarrollo`,
        //             iconURL: interaction.user.displayAvatarURL()
        //         })
        //         .setColor("Red"),
        //     ephemeral: true
        // })

        await replyEmbed({
            interaction,
            embed: EmptyEmbed()
                .setDescription("En desarrollo..."),
            ephemeral: true
        })
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) // Requires the "Ban Members" permission
    .addUserOption(option =>
        option.setName("user")
            .setDescription("The user to ban")
            .setRequired(true))
    .addStringOption(option =>
        option.setName("reason")
            .setDescription("The reason for the ban")
            .setRequired(false))


    ;

