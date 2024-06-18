import { ApplicationCommandOptionType, CacheType, ChannelType, ChatInputCommandInteraction, EmbedBuilder, GuildChannel, PermissionsBitField, VoiceChannel } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

// deprecated
export default class move extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "move",
            description: "Mueve a todos los usuarios de un canal de voz a otro canal de voz",
            category: Category.Moderation,
            dev: true,
            default_member_permissions: PermissionsBitField.Flags.MoveMembers,
            dm_permissions: false,
            cooldown: 3,
            deprecated: false,
            options: [
                {
                    name: "from",
                    description: "Canal de voz de origen",
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildVoice],
                    required: true,
                },
                {
                    name: "to",
                    description: "Canal de voz de destino",
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildVoice],
                    required: true
                }
            ]
        })
    }

    async Execute(interaction: ChatInputCommandInteraction<CacheType>) {
        let from = interaction.options.getChannel("from") as VoiceChannel;
        let to = interaction.options.getChannel("to") as VoiceChannel;

        from = await interaction.guild?.channels.fetch(from.id) as VoiceChannel;
        to = await interaction.guild?.channels.fetch(to.id) as VoiceChannel;
        
        const errorEmbed = new EmbedBuilder().setColor("Red");
        
        if (from.members.size == 0)
            return interaction.reply({
                embeds: [errorEmbed
                    .setColor("Red")
                    .setDescription("❌ El canal de origen no tiene miembros para mover")
                ]
            });
        
        // Corrección: Verificar si el canal de destino tiene un límite y si no puede acomodar a todos los miembros del canal de origen
        if (from.members.size > (to.userLimit ? to.userLimit - to.members.size : Infinity))
            return interaction.reply({
                embeds: [
                    errorEmbed
                        .setColor("Red")
                        .setDescription("❌ El canal de destino no tiene suficiente espacio para los miembros del canal de origen")
                        .addFields(
                            { name: "Espacio requerido", value: from.members.size.toString(), inline: true },
                            { name: "Espacio disponible", value: (to.userLimit - to.members.size).toString(), inline: true }
                        )
                ]
            });
        
        from.members.forEach(member => {
            member.voice.setChannel(to);
        });
        
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setDescription(`✅ Se movieron ${from.members.size} miembros de ${from.name} a ${to.name}`)
            ]
        });
    }
}