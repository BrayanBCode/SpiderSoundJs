import { Client, GatewayIntentBits } from "discord.js";
import { LavalinkManager } from "lavalink-client/dist/types";
import { Command, SubCommand } from "../types/Client.js";
import { BotClientOptions } from "../interface/BotClientOptions.js";
import { config } from "../config/config.js";
import { lavaManagerCustom } from "./lavaManagerCustom.js";
import { Tools } from "../utils/tools.js";
import { deployAllCommands } from "../handler/CommandsDeployer.js";
import { registerDiscordEvents } from "../handler/DiscordEventDeployer.js";
import { loadLavalinkEvents } from "../handler/LavalinkEventDeployer.js";
import { join } from "node:path";

export class BotClient extends Client {
    lavaManager: lavaManagerCustom;
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
        this.lavaManager = new lavaManagerCustom({
            nodes: [
                {
                    authorization: config.lavalink.authorization,
                    host: config.lavalink.host,
                    port: config.lavalink.port,
                    id: config.bot.user,

                },
            ],
            sendToShard: (guildId, payload) =>
                this.guilds.cache.get(guildId)?.shard?.send(payload),
        })
    }

    async init() {
        console.log("|| Inicializando ||");

        registerDiscordEvents(this, join(process.cwd(), "dist", "Events", "discord"))
        // loadLavalinkEvents(this, join(process.cwd(), "dist", "Events", "lavalink"))
        // deployAllCommands(this);

        this.login(config.bot.token)
    }


}

