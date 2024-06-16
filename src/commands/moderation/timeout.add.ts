import { ChatInputCommandInteraction, CacheType, GuildMember, EmbedBuilder, GuildMemberRoleManager, TextChannel } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import ms from "ms";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class TimeoutAdd extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "timeout.add",
        });
    }

    async Execute(interaction: ChatInputCommandInteraction<CacheType>) {
        const target = interaction.options.getMember("target") as GuildMember;
        const reason = interaction.options.getString("reason") || "Sin razón especificada";
        const time = interaction.options.getString("time") || "5m";
        const silent = interaction.options.getBoolean("silent") || false;

        const msLength = ms(time);

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
                    .setDescription("❌ No te puedes sancionar/suspender a ti mismo")],
                ephemeral: true
            });

        if (target.roles.highest.position >= (interaction.member?.roles as GuildMemberRoleManager).highest.position)
            return interaction.reply({
                embeds: [errorEmbed
                    .setDescription("❌ No puedes sancionar/suspender a un usuario con un rol igual o superior al tuyo")],
                ephemeral: true
            });

        if (target.communicationDisabledUntil != null && target.communicationDisabledUntil > new Date()) {
            const now = new Date();
            const suspensionEnd = new Date(target.communicationDisabledUntil);
            const timeLeft = suspensionEnd.getTime() - now.getTime();

            // Convertir el tiempo restante de milisegundos a un formato legible
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            return interaction.reply({
                embeds: [errorEmbed
                    .setDescription(`❌ El usuario ya está suspendido. Tiempo restante: ${days}d, ${hours}h, ${minutes}m, ${seconds}s.`)],
                ephemeral: true
            });
        }

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
                    ⏳ Has sido sancionado/suspendido por \`${time}\` en el servidor \`${interaction.guild?.name}\`
                    Razón: ${reason}`)
                    .setThumbnail(interaction.guild?.iconURL({})!)
                ]
            });
        } catch (error) {
            // Do nothing
        }

        try {
            await target.timeout(msLength, reason);
        } catch {
            return interaction.reply({
                embeds: [
                    errorEmbed.setDescription("❌ Ha ocurrido un error al intentar sancionar/suspender al usuario")],
                ephemeral: true
            });
        }

        interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor("Blue")
                .setDescription(`⏳ ${target} ha sido sancionado/suspendido por \`${msLength}\``)
            ], ephemeral: true
        });


        if (!silent)
            interaction.channel?.send({
                embeds: [new EmbedBuilder()
                    .setColor("Blue")
                    .setThumbnail(target.user.displayAvatarURL({ size: 64 }))
                    .setAuthor({ name: `🔨 Suspendido | ${target.user.tag}` })
                    .setDescription(`
                        **Razón:** \`${reason}\`
                        **Expira:** <t:${(Date.now() + msLength / 1000).toFixed(0)}:F>
                        `)
                    .setTimestamp()
                    .setFooter({ text: `ID: ${target.id}` })
                ]
            })
                .then(async (x) => await x.react("⏳"))

        const guild = await GuildConfig.findOne({ guildID: interaction.guildId });

        if (guild && guild?.logs?.moderation?.enabled && guild?.logs?.moderation?.channelID)
            (await interaction.guild?.channels.fetch(guild.logs.moderation.channelID) as TextChannel)?.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Blue")
                        .setAuthor({ name: `⏳ Suspendido | ${target.user.tag}` })
                        .setThumbnail(target.user.displayAvatarURL({ size: 64 }))
                        .setDescription(`
                        **Usuario:** ${target}
                        **Moderador:** ${interaction.member}
                        **Razón:** \`${reason}\`
                        **Tiempo** \`${time}\`
                        **Expira:** <t:${(Date.now() + msLength / 1000).toFixed(0)}:F>
                        `)
                        .setTimestamp()
                        .setFooter({ text: `ID: ${target.id}` })
                ]
            })

    }
}