import { Client, Collection, GatewayIntentBits, IntentsBitField } from "discord.js";
import { IConfig } from "../interfaces/IConfig";
import ICustomClient from "../interfaces/ICustomClient";
import Handler from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";
import { connect } from "mongoose";
import { Poru } from "poru";
import SpiderPlayer from "./SpiderPlayer/player";


export default class CustomClient extends Client implements ICustomClient {
    config: IConfig;
    handler: Handler;
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    developmentMode: boolean;
    developerUserIDs: string[];
    player: SpiderPlayer;


    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.MessageContent
            ]
        })


        this.config = require(`${process.cwd()}/data/config.json`)
        this.handler = new Handler(this)
        this.commands = new Collection()
        this.subCommands = new Collection()
        this.cooldowns = new Collection()
        this.developmentMode = process.argv.includes("--dev");
        this.developerUserIDs = this.config.developerUserIDs
        this.player = new SpiderPlayer(this)

    }

    async Init() {

        console.log(`-- Iniciando bot en ${this.developmentMode ? "modo desarrollo" : "modo producción"}`)
        await this.LoadHandlers()


        
        await this.login(this.developmentMode ? this.config.devToken : this.config.token)
        .catch((err) => console.log(`Error al conectar: ${err}`))
        
        connect(this.developmentMode ? this.config.devMongoURL : this.config.mongoURL)
            .then(() => console.log("Conectado a la base de datos"))
            .catch((err) => console.log(`Error al conectar a la base de datos: ${err}`))

    }

    async LoadHandlers(): Promise<void> {
        console.log("Cargando handlers...")
        this.handler.LoadEvents()
        this.handler.LoadCommands()
    }

}