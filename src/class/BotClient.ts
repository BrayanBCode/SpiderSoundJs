import { Client } from "discord.js";
import { ICommand, SubCommand } from "../types/Client.js";
import { BotClientOptions } from "../interface/BotClientOptions.js";
import { config } from "../config/config.js";
import { lavaManagerCustom } from "./lavaManagerCustom.js";
import { Tools } from "../utils/tools.js";
import { registerDiscordEvents } from "../handler/RegisterDiscordEvent.js";

export class BotClient extends Client {
    lavaManager!: lavaManagerCustom; // Inicializado más tarde
    commands: Map<string, ICommand | SubCommand>;
    defaultVolume: number;
    debugMode: boolean;
    Tools: Tools;

    constructor(options: BotClientOptions) {
        const intents = options.intents;
        super({ intents });

        this.commands = options.commands ?? new Map();
        this.defaultVolume = options.defaultVolume ?? 10.0;
        this.debugMode = options.debugMode ?? false;
        this.Tools = new Tools(this);
    }

    async init() {
        await registerDiscordEvents(this)
        this.login(config.bot.token)
    }

}

