import { AutocompleteInteraction, CacheType, ChatInputCommandInteraction, Client, Guild, GuildMember, TextChannel } from "discord.js";
import { ICommand, SubCommand } from "../types/Client.js";
import { BotClientOptions } from "../interface/BotClientOptions.js";
import { config } from "../config/config.js";
import { LavaManagerCustom } from "./lavaManagerCustom.js";
import { registerDiscordEvents } from "../handler/RegisterDiscordEvent.js";
import { PlayerMessage } from "./playerMessage.js";


export class BotClient extends Client {
    lavaManager!: LavaManagerCustom;
    commands: Map<string, ICommand | SubCommand>;
    defaultVolume: number;
    debugMode: boolean;
    playerMessage: PlayerMessage


    constructor(options: BotClientOptions) {
        const intents = options.intents;
        super({ intents });

        this.commands = options.commands ?? new Map();
        this.defaultVolume = options.defaultVolume ?? 10.0;
        this.debugMode = options.debugMode ?? false;

        this.playerMessage = new PlayerMessage(this)

    }

    /**
     * Adaptar el codigo a este getter
     */
    get playingMessage() {
        return this.lavaManager.playingMessages
    }

    getPlayer(guildId: string) {
        return this.lavaManager.getPlayer(guildId)
    }

    getPlayerOrDefault(inter: ChatInputCommandInteraction<"cached"> | AutocompleteInteraction<CacheType>, guildId: string) {
        let player = this.lavaManager.getPlayer(guildId)

        player ??= this.lavaManager.createPlayer({
            guildId: guildId,
            voiceChannelId: (inter.member as GuildMember).voice.channelId!,
            textChannelId: inter.channelId,
            selfDeaf: true,
            selfMute: false,
            volume: this.defaultVolume,
            node: config.bot.user,
            vcRegion: (inter.member as GuildMember)?.voice.channel?.rtcRegion!
        })

        return player
    }

    getGuild(guildId: string) {
        return this.guilds.cache.get(guildId) as Guild | undefined
    }

    getTextChannel(channelID: string) {
        return this.channels.cache.get(channelID) as TextChannel | undefined;
    }

    async init() {
        await registerDiscordEvents(this)
        this.login(config.bot.token)
    }

}

