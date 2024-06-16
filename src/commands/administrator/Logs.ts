import { Application, ApplicationCommandOptionType, ChannelType, PermissionFlagsBits } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Logs extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "logs",
            description: "Configura los canales de logs de tu servidor",
            category: Category.Administrator,
            default_member_permissions: PermissionFlagsBits.Administrator,
            dm_permissions: false,
            cooldown: 3,
            dev: false,
            options: [
                {
                    name: "toggle",
                    description: "Activa o desactiva los logs en tu servidor",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "log-type",
                            description: "Tipo de log a activar/desactivar",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                { name: "Logs de moderación", value: "moderation" },
                            ]
                        },
                        {
                            name: "toggle",
                            description: "Activa o desactiva los logs",
                            type: ApplicationCommandOptionType.Boolean,
                            required: true,

                        }
                    ]
                },
                {
                    name: "set",
                    description: "Establece el canal de logs en tu servidor",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "log-type",
                            description: "Tipo de log a establecer",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                { name: "Logs de moderación", value: "moderation" },
                            ]
                        },
                        {
                            name: "channel",
                            description: "Canal donde se enviarán los logs",
                            type: ApplicationCommandOptionType.Channel,
                            required: true,
                            channel_types: [ChannelType.GuildText]
                            
                        }
                    ]
                }
            ]

        }
        );
    }
}