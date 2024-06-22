import { ApplicationCommandOptionType, CacheType, ChatInputCommandInteraction, GuildMember, InteractionResponse, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import YoutubeHelper from "../../base/classes/SpiderPlayer/YoutubeHelper";
import Song from "../../base/classes/SpiderPlayer/Song";

export default class Play extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "play",
            description: "Play a song",
            category: Category.Music,
            default_member_permissions: PermissionsBitField.Flags.SendMessages,
            dm_permissions: false,
            dev: true,
            deprecated: false,
            cooldown: 3,
            options: [
                {
                    name: "query",
                    description: "The song you want to play",
                    type: ApplicationCommandOptionType.String,
                    required: false
                }
            ]
        })
    }

    async Execute(interaction: ChatInputCommandInteraction<CacheType>) {
        interaction.deferReply();
        const query = interaction.options.getString("query");

        if (!query) {
            interaction.reply("You need to provide a query to search for a song.");
            return;
        }

        const player = this.client.player.create_player(interaction.guildId!, {
            client: this.client,
            loop: false,
            deaf: true
        });

        let video: Song | Song[] | null;
        const type = YoutubeHelper.identifySearchType(query);
        switch (type) {
            case "video":
                video = await YoutubeHelper.getVideoInfo(query);
                if (!video) {
                    interaction.reply("No videos found.");
                    return;
                }
                break

            case "playlist":
                video = await YoutubeHelper.getPlaylistInfo(query);
                if (!video) {
                    interaction.reply("No videos found.");
                    return;
                }
                break

            case "search":
                video = await YoutubeHelper.searchVideos(query);
                if (!video) {
                    interaction.reply("No videos found.");
                    return;
                }
                break

            case "mix":
                video = await YoutubeHelper.getMixInfo(query);
                if (!video) {
                    interaction.reply("No videos found.");
                    return;
                }
                break

            default:
                this.client.player.destroy_player(interaction.guildId!);
                interaction.reply("tipo de busqueda no soportado.");
                return;
        }

        console.log("process status: \n", video)

        player.joinVoiceChannel((interaction.member as GuildMember).voice.channelId!);

        player.addSong(video);

        await player.play()

        interaction.followUp(`Esta sonando ${player.queue[0].title} en el canal de voz.`)

    }
}