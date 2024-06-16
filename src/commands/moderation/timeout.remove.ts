import { ChatInputCommandInteraction, CacheType, GuildMember, EmbedBuilder, GuildMemberRoleManager, TextChannel } from "discord.js";
import ms from "ms";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class TimeoutRemove extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "timeout.remove",
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
                    .setDescription("❌ No te puedes des sancionar/suspender a ti mismo")],
                ephemeral: true
            });

        if (target.roles.highest.position >= (interaction.member?.roles as GuildMemberRoleManager).highest.position)
            return interaction.reply({
                embeds: [errorEmbed
                    .setDescription("❌ No puedes des sancionar/suspender a un usuario con un rol igual o superior al tuyo")],
                ephemeral: true
            });

        if (target.communicationDisabledUntil == null)
            return interaction.reply({
                embeds: [errorEmbed
                    .setDescription(`❌ El usuario no está sancionado/suspendido`)],
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
                    .setColor("Green")
                    .setDescription(`
                    ⌛ Tu sanción/suspención fue removida por \`${interaction.member}\` en el servidor \`${interaction.guild?.name}\`
                    Razón: ${reason}`)
                    .setThumbnail(interaction.guild?.iconURL({})!)
                ]
            });
        } catch (error) {
            // Do nothing
        }

        try {
            await target.timeout(null, reason)
        } catch {
            return interaction.reply({
                embeds: [
                    errorEmbed.setDescription(`❌ Ha ocurrido un error al intentar remover la sancionar/suspender al usuario ${target}`)],
                ephemeral: true
            });
        }

        interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor("Green")
                .setDescription(`⌛ Se le quito la sanción/suspención a ${target}`)
            ], ephemeral: true
        });


        if (!silent)
            interaction.channel?.send({
                embeds: [new EmbedBuilder()
                    .setColor("Blue")
                    .setThumbnail(target.user.displayAvatarURL({ size: 64 }))
                    //se le quita la suspencion al usuario
                    .setAuthor({ name: `Suspención quitada | ${target.user.tag}` })
                    .setDescription(`
                        **Razón:** \`${reason}\`
                        `)
                    .setTimestamp()
                    .setFooter({ text: `ID: ${target.id}` })
                ]
            })
                .then(async (x) => await x.react("⌛"))

        const guild = await GuildConfig.findOne({ guildID: interaction.guildId });

        if (guild && guild?.logs?.moderation?.enabled && guild?.logs?.moderation?.channelID)
            (await interaction.guild?.channels.fetch(guild.logs.moderation.channelID) as TextChannel)?.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Blue")
                        .setAuthor({ name: `⌛ Suspencion quitada | ${target.user.tag}` })
                        .setThumbnail(target.user.displayAvatarURL({ size: 64 }))
                        .setDescription(`
                        **Usuario:** ${target}
                        **Moderador:** ${interaction.member}
                        **Razón:** \`${reason}\`
                        `)
                        .setTimestamp()
                        .setFooter({ text: `ID: ${target.id}` })
                ]
            })

    }
}