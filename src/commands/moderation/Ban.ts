import { ApplicationCommandOptionType, CacheType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, GuildMemberRoleManager, PermissionsBitField, TextChannel } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class Ban extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "ban",
            description: "Gestiona los bans de los miembros del servidor",
            category: Category.Moderation,
            dev: false,
            default_member_permissions: PermissionsBitField.Flags.BanMembers,
            dm_permissions: false,
            cooldown: 3,
            options: [
                {
                    name: "target",
                    description: "Usuario a banear",
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Razón del ban",
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: "days",
                    description: "Días de mensajes a borrar",
                    type: ApplicationCommandOptionType.Integer,
                    required: false,
                    choices: [
                        {
                            name: "None",
                            value: 0
                        },
                        {
                            name: "1 dia",
                            value: 86400
                        },
                        {
                            name: "7 dias",
                            value: 604800
                        },
                    ]
                },
                {
                    name: "silent",
                    description: "Banea al usuario sin enviar mensaje al canal de texto",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                }
            ]

        });
    }


    async Execute(interaction: ChatInputCommandInteraction<CacheType>) {
        const target = interaction.options.getMember("target") as GuildMember;
        const reason = interaction.options.getString("reason") || "Sin razón especificada";
        const days = interaction.options.getInteger("days") || 0;
        const silent = interaction.options.getBoolean("silent") || false;

        const errorEmbed = new EmbedBuilder().setColor("Red");

        if (!target)
            return interaction.reply({
                embeds: [
                    errorEmbed.setDescription("❌ Debes mencionar a un usuario")],
                ephemeral: true
            });

        if (target.id == interaction.user.id)
            return interaction.reply({
                embeds: [
                    errorEmbed.setDescription("❌ No te puedes banear a ti mismo")],
                ephemeral: true
            });

        if (target.roles.highest.position >= (interaction.member?.roles as GuildMemberRoleManager).highest.position)
            return interaction.reply({
                embeds: [
                    errorEmbed.setDescription("❌ No puedes banear a un usuario con un rol igual o superior al tuyo")],
                ephemeral: true
            });

        if (!target.bannable)
            return interaction.reply({
                embeds: [
                    errorEmbed.setDescription("❌ No puedo banear a este usuario")],
                ephemeral: true
            });

        if (reason.length > 512)
            return interaction.reply({
                embeds: [
                    errorEmbed.setDescription("❌ La razón no puede superar los 512 caracteres")],
                ephemeral: true
            });

        try {
            await target.send({
                embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`
                    🔨 Fuiste **baneado** de \`${interaction.guild?.name}\` por ${interaction.member}
                    Si quieres apelar al ban, contacta con el staff del servidor.

                    **Razón:** \`${reason}\`
                    `)
                ]
            })
        } catch (error) {
            // No se pudo enviar el mensaje al usuario
        }

        try {
            await target.ban({ deleteMessageSeconds: days, reason: reason });
        } catch (error) {
            return interaction.reply({
                embeds: [
                    errorEmbed
                        .setColor("Red")
                        .setDescription("❌ Ha ocurrido un error al intentar banear al usuario")
                ], ephemeral: true
            })
        }

        interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`
                🔨 ${target} - ${target.id} ha sido baneado del servidor`)],
            ephemeral: true
        });

        if (!silent)
            interaction.channel?.send({
                embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setThumbnail(target.user.displayAvatarURL({ size: 64 }))
                    .setAuthor({ name: `🔨 Ban | ${target.user.tag}` })
                    .setDescription(`
                        **Razón:** \`${reason}\`
                        ${days == 0 ? "" : `Los mensajes de los últimos \`${(days / 60) / 60}\` horas han sido eliminados`}
                        `)
                    .setTimestamp()
                    .setFooter({ text: `ID: ${target.id}` })
                ]
            })
                .then(async (x) => await x.react("🔨"))

        const guild = await GuildConfig.findOne({ guildID: interaction.guildId });

        if (guild && guild?.logs?.moderation?.enabled && guild?.logs?.moderation?.channelID)
            (await interaction.guild?.channels.fetch(guild.logs.moderation.channelID) as TextChannel)?.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setAuthor({ name: `🔨 Ban | ${target.user.tag}` })
                        .setThumbnail(target.user.displayAvatarURL({ size: 64 }))
                        .setDescription(`
                        **Usuario:** ${target}
                        **Moderador:** ${interaction.member}
                        **Razón:** \`${reason}\`
                        ${days == 0 ? "" : `Los mensajes de los últimos \`${(days / 60) / 60}\` horas han sido eliminados`}
                        `)
                        .setTimestamp()
                        .setFooter({ text: `ID: ${target.id}` })
                ]
            })
    }
}

