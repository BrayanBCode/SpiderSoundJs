import { PermissionsBitField, ApplicationCommandOptionType, CacheType, ChatInputCommandInteraction, GuildMember, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import { Player, Poru, Response } from "poru";
import { joinVoiceChannel, createAudioPlayer, createAudioResource } from '@discordjs/voice';
import { Buffer } from 'buffer';

export default class Play extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "play",
            description: "Reproduce una canción",
            category: Category.Music,
            dev: true,
            default_member_permissions: PermissionsBitField.Flags.Connect,
            dm_permissions: false,
            cooldown: 3,
            deprecated: false,
            options: [
                {
                    name: "query",
                    description: "Nombre de la canción o URL de YouTube",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        })
    }

    async Execute(interaction: ChatInputCommandInteraction<CacheType>) {
        await interaction.deferReply();

        const query = interaction.options.getString("query") as string;
        const member = await interaction.guild?.members.fetch(interaction.user.id)

        const voiceChannel = member?.voice.channel;

        if (!(interaction.member as GuildMember).voice.channelId) {
            return interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setTitle("Error")
                    .setDescription("Debes estar en un canal de voz para usar este comando")
                    .setColor("Red")
                ], ephemeral: true
            });
        }

        const player = this.client.poru?.createConnection({
            guildId: interaction.guild?.id!,
            voiceChannel: voiceChannel?.id!,
            textChannel: interaction.channel?.id!,
            deaf: true
        })

        interaction.followUp({embeds: [new EmbedBuilder()
            .setDescription("Testing...")
        ]})

    }
}