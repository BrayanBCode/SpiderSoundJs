import { Client, Guild, VoiceChannel } from "discord.js";
import IGuild_player from "../../interfaces/ISpiderPlayer/IGuild_player";
import IGuild_player_Options from "../../interfaces/ISpiderPlayer/IGuild_player_Options";
import { AudioPlayer, StreamType, VoiceConnection, createAudioPlayer, joinVoiceChannel } from "@discordjs/voice";
import Song from "./Song";
import YouTubeHelper from "./YoutubeHelper";
import { createAudioResource } from "@discordjs/voice";

const YouTube = YouTubeHelper;

export default class Guild_player {
    private lastPlaybackTime: number = 0;
    private intervalId: NodeJS.Timeout | null = null;

    client: Client;
    guild_id: string;
    defean: boolean
    loop: boolean
    queue: Song[]
    on_vc: boolean
    channelVoice_id: string | null
    channelText_id: string | null
    connection: VoiceConnection | null
    player: AudioPlayer

    constructor(guild_id: string, options: IGuild_player_Options) {
        this.client = options.client;
        this.guild_id = guild_id;
        this.defean = options.deaf;
        this.loop = options.loop;
        this.queue = [];

        this.player = createAudioPlayer();
        this.channelVoice_id = null;
        this.channelText_id = null;
        this.connection = null;
        this.on_vc = false;
    }

    getGuild() {
        return this.client.guilds.cache.get(this.guild_id)
    }

    joinVoiceChannel(channel_id: string) {
        const connection = joinVoiceChannel({
            channelId: channel_id,
            guildId: this.guild_id,
            adapterCreator: this.getGuild()?.voiceAdapterCreator!
        })

        this.connection = connection;
    }

    addSong(song: Song | Song[]) {
        if (Array.isArray(song))
            this.queue = this.queue.concat(song);
        else
            this.queue.push(song);
    }

    async play() {
        if (!this.connection || this.queue.length === 0 || this.player.state.status === 'playing' || this.player.state.status === 'paused') {
            if (this.player.state.status === 'paused') this.player.unpause();
            return;
        }

        const song = this.queue.shift();

        const stream = await YouTube.getStream(song!.url, { startTime: this.lastPlaybackTime });
        const resource = createAudioResource(stream, {inlineVolume: true});

        this.player.play(resource);
        this.connection.subscribe(this.player);


        if (!this.intervalId) this.intervalId = setInterval(() => this.lastPlaybackTime++, 1000);

        this.player.on('stateChange', (oldState, newState) => {
            if (newState.status === 'idle') {
                console.log('Reproductor en estado idle');
                this.player.play(resource)
                this.lastPlaybackTime = 0;
                clearInterval(this.intervalId!);
                this.intervalId = null;
                this.play();
            }
        });

        this.player.on('error', (error) => {
            console.error(`Error en el reproductor: ${error.message}`);
            if (error.message === 'aborted') {
                console.log('Reproducción abortada, intentando reproducir la siguiente canción...');
                this.player.play(resource);
                // this.queue.unshift(song!);
                // this.play();
                // clearInterval(this.intervalId!);
                // this.lastPlaybackTime = 0
            }
        });
    }

}

