import { ApplicationCommandOptionType, CacheType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField, TextChannel } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class Unban extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "unban",
            description: "Gestiona los bans de los miembros del servidor",
            category: Category.Moderation,
            dev: false,
            default_member_permissions: PermissionsBitField.Flags.BanMembers,
            dm_permissions: false,
            cooldown: 3,
            options: [
                {
                    name: "target",
                    description: "Usuario a desbanear, ingrese el ID del usuario",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "reason",
                    description: "Razón del desban",
                    type: ApplicationCommandOptionType.String,
                    required: false
                },   
                {
                    name: "silent",
                    description: "Desbanea al usuario sin enviar mensaje al canal de texto",
                    type: ApplicationCommandOptionType.Boolean,
                    required: false,
                }
            ]

        });
    }

    
    async Execute(interaction: ChatInputCommandInteraction<CacheType>) {
        const target = interaction.options.getString("target");
        const reason = interaction.options.getString("reason") || "Sin razón especificada";
        const silent = interaction.options.getBoolean("silent") || false;

        const errorEmbed = new EmbedBuilder().setColor("Red");

        if (reason.length > 512)
            return interaction.reply({
                embeds: [
                    errorEmbed.setDescription("❌ La razón no puede superar los 512 caracteres")],
                ephemeral: true
            });

        try {
            await interaction.guild?.bans.fetch(target!);
        } catch {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("❌ El usuario no está baneado")],
                ephemeral: true
            });
        }


        try {
            await interaction.guild?.bans.remove(target!, reason );
        } catch (error) {
            return interaction.reply({
                embeds: [
                    errorEmbed
                        .setColor("Red")
                        .setDescription("❌ Ha ocurrido un error al intentar desbanear al usuario")
                ], ephemeral: true
            })
        }

        interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor("Green")
                .setDescription(`
                🔨 ${target} ha sido desbaneado del servidor`)],
            ephemeral: true
        });

        if (!silent)
            interaction.channel?.send({
                embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setAuthor({ name: `🔨 Unban | ${target}` })
                    .setDescription(`
                        **Razón:** \`${reason}\`
                        `)
                    .setTimestamp()
                ]
            })

        const guild = await GuildConfig.findOne({ guildID: interaction.guildId });

        if (guild && guild?.logs?.moderation?.enabled && guild?.logs?.moderation?.channelID)
            (await interaction.guild?.channels.fetch(guild.logs.moderation.channelID) as TextChannel)?.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setAuthor({ name: "🔨 Unban" })
                        .setDescription(`
                        **User:** ${target}
                        **Razón** \`${reason}\`
                        `)
                        .setTimestamp()
                        .setFooter({
                            text: `Pedido por ${interaction.user.tag} | ID: ${interaction.user.id}`,
                            iconURL: interaction.user.displayAvatarURL({}),
                        })

                ]
            })
    }
}




