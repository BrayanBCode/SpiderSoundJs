import { Client, GatewayIntentBits } from "discord.js";
import { LavalinkManager } from "lavalink-client/dist/types";
import { Command, SubCommand } from "../types/Client.js";
import { deployEvents } from "../handlers/deploy-handlers.js";
import { BotClientOptions } from "../interface/BotClientOptions.js";
import { config } from "../config/config.js";
import { lavaManagerCustom } from "./lavaManagerCustom.js";
import { Tools } from "../utils/tools.js";

export class BotClient extends Client {
    lavaManager?: lavaManagerCustom;
    commands: Map<string, Command | SubCommand>;
    defaultVolume: number;
    debugMode: boolean;
    Tools: Tools;

    constructor(options: BotClientOptions) {
        const intents = options.intents
        super({ intents });

        this.commands = options.commands ? options.commands : new Map();
        this.defaultVolume = options.defaultVolume ? options.defaultVolume : 10.0;
        this.debugMode = options.debugMode ? true : false;
        this.Tools = new Tools(this)
    }

    async init() {
        console.log("|| Inicializando ||");
        deployEvents(this)
        this.login(config.bot.token)
    }


}

