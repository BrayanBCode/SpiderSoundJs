import { ApplicationCommandOptionType, CacheType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, GuildMemberRoleManager, PermissionsBitField, TextChannel } from "discord.js";
import Command from "../../base/classes/Command";
import Category from "../../base/enums/Category";
import CustomClient from "../../base/classes/CustomClient";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class Kick extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "kick",
            description: "Expulsa a un usuario del servidor",
            category: Category.Moderation,
            default_member_permissions: PermissionsBitField.Flags.KickMembers,
            dm_permissions: false,
            cooldown: 3,
            dev: false,
            deprecated: false,
            options: [
                {
                    name: "target",
                    description: "Usuario a expulsar",
                    type: ApplicationCommandOptionType.User,
                    required: true,
                    options: []

                },
                {
                    name: "reason",
                    description: "Razón de la expulsión",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    options: []

                },
                {
                    name: "silent",
                    description: "Expulsa al usuario sin enviar mensaje al canal de texto",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                    options: []

                },

            ]
        });
    }
    async Execute(interaction: ChatInputCommandInteraction<CacheType>) {
        const target = interaction.options.getMember("target") as GuildMember;
        const reason = interaction.options.getString("reason") || "Sin razón especificada";
        const silent = interaction.options.getBoolean("silent") || false;

        const errorEmbed = new EmbedBuilder().setColor("Red");


        if (!target)
            return interaction.reply({
                embeds: [errorEmbed
                    .setDescription("❌ Debes mencionar a un usuario")],
                ephemeral: true
            });

        if (target.id == interaction.user.id)
            return interaction.reply({
                embeds: [errorEmbed
                    .setDescription("❌ No te puedes expulsar a ti mismo")],
                ephemeral: true
            });

        if (target.roles.highest.position >= (interaction.member?.roles as GuildMemberRoleManager).highest.position)
            return interaction.reply({
                embeds: [errorEmbed
                    .setDescription("❌ No puedes expulsar a un usuario con un rol igual o superior al tuyo")],
                ephemeral: true
            });

        if (!target.kickable)
            return interaction.reply({
                embeds: [errorEmbed
                    .setDescription("❌ No puedo expulsar a este usuario")],
                ephemeral: true
            });

        if (reason.length > 512)
            return interaction.reply({
                embeds: [errorEmbed
                    .setDescription("❌ La razón no puede superar los 512 caracteres")],
                ephemeral: true
            });

        try {
            await target.send({
                embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`
                    🥾 Fuiste **expulsado** de \`${interaction.guild?.name}\` por ${interaction.member}
                    Si quieres apelar al kick, contacta con el staff del servidor.

                    **Razón:** \`${reason}\`
                    `)
                    .setThumbnail(target.displayAvatarURL({ size: 64 }))
                ]
            })
        } catch (error) {
            return interaction.reply({
                //No tiene los dm habilitados
            });
        }

        try {
            await target.kick(reason);
        } catch (error) {
            return interaction.reply({
                embeds: [errorEmbed
                    .setDescription("❌ Ha ocurrido un error al intentar expulsar al usuario")], ephemeral: true
            })
        }

        interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor("Green")
                .setDescription(`🥾 ${target} ha sido expulsado del servidor`)
            ], ephemeral: true
        });

        if (!silent)
            interaction.channel?.send({
                embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setAuthor({ name: `🥾 Kick | ${target.user.tag}` })
                    .setDescription(`
                        **Razón:** \`${reason}\`
                        `)
                    .setTimestamp()
                    .setFooter({ text: `ID: ${target.id}` })
                ]
            })
                .then(async (x) => x.react("🥾"))

        const guild = await GuildConfig.findOne({ guildID: interaction.guildId });

        if (guild && guild?.logs?.moderation?.enabled && guild?.logs?.moderation?.channelID)
            (await interaction.guild?.channels.fetch(guild.logs.moderation.channelID) as TextChannel)?.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Orange")
                        .setAuthor({ name: `🥾 Kick | ${target.user.tag}` })
                        .setThumbnail(target.user.displayAvatarURL({ size: 64 }))
                        .setDescription(`
                        **Usuario:** ${target}}
                        **Moderador:** ${interaction.member}
                        **Razón:** \`${reason}\`
                        `)
                        .setTimestamp()
                        .setFooter({ text: `ID: ${target.id}` })
                ]
            })



    }



}