import { Client, Collection, IntentsBitField } from "discord.js";
import { IConfig } from "../interfaces/IConfig";
import ICustomClient from "../interfaces/ICustomClient";
import Handler from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";

export default class CustomClient extends Client implements ICustomClient {
    config: IConfig;
    handler: Handler;
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    developmentMode: boolean;

    constructor() {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.MessageContent,
            ]
        })

        this.config = require(`${process.cwd()}/data/config.json`)
        this.handler = new Handler(this)
        this.commands = new Collection()
        this.subCommands = new Collection()
        this.cooldowns = new Collection()
        this.developmentMode = process.argv.includes("--dev");
    }

    Init(): void {
        console.log(`-- Iniciando bot en ${this.developmentMode ? "modo desarrollo" : "modo producción"}`)
        this.LoadHandlers()

        this.login(this.developmentMode ? this.config.devToken : this.config.token)
            .catch((err) => console.log(`Error al conectar: ${err}`))
    }
    LoadHandlers(): void {
        console.log("Cargando handlers...")
        this.handler.LoadEvents()
        this.handler.LoadCommands()
    }

}