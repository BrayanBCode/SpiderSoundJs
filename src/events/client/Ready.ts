import { Collection, Events, REST, Routes } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";

export default class Ready extends Event {
    // español
    constructor(client: CustomClient) {
        super(client, {
            name: Events.ClientReady,
            description: "Evento que se ejecuta cuando el cliente está listo",
            once: true
        });
    }

    async Execute() {
        console.log(`Estoy conectado como ${this.client.user?.tag}`);

        const clientId = this.client.developmentMode ? this.client.config.devClientID : this.client.config.ClientID;
        const token = this.client.developmentMode ? this.client.config.devToken : this.client.config.token;
        const rest = new REST().setToken(token);

        if (!this.client.developmentMode) {
            const globalCommands: any = await rest.put(Routes.applicationCommands(clientId),
                {
                    body: this.GetJson(this.client.commands.filter(command => !command.dev && !command.deprecated))
                });

            console.log(`Comandos (/) globales cargados con exito ${globalCommands.length}`);

        }

        const devCommands: any = await rest.put(Routes.applicationGuildCommands(clientId, this.client.config.devGuildID),
            {
                body: this.GetJson(this.client.commands.filter(command => command.dev && !command.deprecated))
            });

        console.log(`Comandos (/) de desarrollador cargados con exito ${devCommands.length}`);

        const Commands = this.client.commands.filter(command => !command.dev);

        Commands.forEach((command: any) => console.log(`- Comando (global) cargado: ${command.name}`))
        devCommands.forEach((command: any) => console.log(`- Comando (dev) cargado: ${command.name}`))

    }

    private GetJson(commands: Collection<string, Command>): Object[] {
        const data: object[] = [];

        commands.forEach(command => {
            data.push({
                name: command.name,
                description: command.description,
                options: command.options,
                default_member_permissions: command.default_member_permissions.toString(),
                dm_permissions: command.dm_permissions,
            })
        })
        return data
    }

}