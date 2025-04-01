import { Client, EmbedBuilder, Guild } from "discord.js";
import { ICommand, SubCommand } from "../types/Client.js";
import { BotClientOptions } from "../interface/BotClientOptions.js";
import { config } from "../config/config.js";
import { lavaManagerCustom } from "./lavaManagerCustom.js";
import { registerDiscordEvents } from "../handler/RegisterDiscordEvent.js";



export class BotClient extends Client {
    lavaManager!: lavaManagerCustom;
    commands: Map<string, ICommand | SubCommand>;
    defaultVolume: number;
    debugMode: boolean;


    constructor(options: BotClientOptions) {
        const intents = options.intents;
        super({ intents });

        this.commands = options.commands ?? new Map();
        this.defaultVolume = options.defaultVolume ?? 10.0;
        this.debugMode = options.debugMode ?? false;

    }

    /**
     * Adaptar el codigo a este getter
     */
    get playingMessage() {
        return this.lavaManager.playingMessages
    }

    createEmbedTemplate() {
        return new EmbedBuilder()
    }

    getPlayer(guildId: string) {
        return this.lavaManager.getPlayer(guildId)
    }

    getGuild(guildId: string) {
        return this.guilds.cache.get(guildId) as Guild
    }

    async init() {
        await registerDiscordEvents(this)
        this.login(config.bot.token)
    }

}

