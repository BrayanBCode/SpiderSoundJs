import { glob } from "glob";
import IHandler from "../interfaces/IHandler";
import path from "path";
import CustomClient from "./CustomClient";
import Event from "./Event";
import Command from "./Command";
import SubCommand from "./SubCommand";
import { Poru } from "poru";


export default class Handler implements IHandler {
    client: CustomClient;

    constructor(client: CustomClient) {
        this.client = client;
    }


    async LoadEvents() {
        const files = (await glob(`build/events/**/**/*.js`)).map(filePath => path.resolve(filePath));
        await Promise.all(files.map(async (file: string) => {
            const event: Event = new (await import(file)).default(this.client);

            if (!event.name) {
                delete require.cache[require.resolve(file)];
                console.log(`${file.split("/").pop()} no tiene un nombre`);
                return;
            }

            const execute = (...args: any) => event.Execute(...args);

            if (event.once)
                //@ts-ignore
                this.client.once(event.name, execute);
            else
                //@ts-ignore
                this.client.on(event.name, execute);

            delete require.cache[require.resolve(file)];
            console.log(`Evento ${event.name} cargado!`);
        }));
        console.log("Eventos cargados!");

    }

    async LoadCommands() {
        const files = (await glob(`build/commands/**/**/*.js`)).map(filePath => path.resolve(filePath));
        await Promise.all(files.map(async (file: string) => {
            const command: Command | SubCommand = new (await import(file)).default(this.client);

            if (!command.name) {
                delete require.cache[require.resolve(file)];
                console.log(`${file.split("/").pop()} no tiene un nombre`);
                return;
            }

            if (file.split("/").pop()?.split(".")[2]) {
                this.client.subCommands.set(command.name, command);
            } else {
                this.client.commands.set(command.name, command as Command);
            }

            delete require.cache[require.resolve(file)];
        }));
        console.log("Comandos cargados!");
    }

    async LoadPoru() {
        this.client.poru = new Poru(this.client, this.client.config.nodes, {
            library: "discord.js",
            defaultPlatform: "ytsearch",
            autoResume: true,
            reconnectTimeout: 10000,
            reconnectTries: 10,

        });
    }
}