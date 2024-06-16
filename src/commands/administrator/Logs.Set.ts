import { ChatInputCommandInteraction, CacheType, TextChannel, EmbedBuilder } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class LogsSet extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "logs.set"
        });
    }

    async Execute(interaction: ChatInputCommandInteraction<CacheType>) {
        const logType = interaction.options.getString("log-type");
        const channel = interaction.options.getChannel("channel") as TextChannel;

        await interaction.deferReply({ ephemeral: true });

        try {
            let guild = await GuildConfig.findOne({ guildID: interaction.guildId });

            if (!guild)
                guild = await GuildConfig.create({ guildID: interaction.guildId });
            
            //@ts-ignore
            guild.logs[`${logType}`].channelID = channel.id;

            await guild.save();

            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor("Green")
                    .setDescription(`✅ Canal de logs de moderación establecido en <#${channel.id}>`)
                ]
            });
        } catch (error) {
            console.log(error);
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setTitle("Error")
                    .setDescription("❌ Ha ocurrido un error al intentar establecer el canal de logs: " + error)
                    .setColor("Red")
                ]
            })
        }
    }
}