import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";

export default class Timeout extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "timeout",
            description: "Gestiona los timeouts de los miembros del servidor",
            category: Category.Moderation,
            default_member_permissions: PermissionsBitField.Flags.MuteMembers,
            options: [
                {
                    name: "add",
                    description: "Añade un timeout a un usuario",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "target",
                            description: "Usuario al que se le aplicará el timeout",
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name: "reason",
                            description: "Razón del timeout",
                            type: ApplicationCommandOptionType.String,
                            required: false
                        },
                        {
                            name: "time",
                            description: "Tiempo del timeout",
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            choices: [
                                { name: "5 minutos", value: "5m" },
                                { name: "10 minutos", value: "10m" },
                                { name: "15 minutos", value: "15m" },
                                { name: "30 minutos", value: "30m" },
                                { name: "1 hora", value: "1h" },
                                { name: "2 horas", value: "2h" },
                                { name: "3 horas", value: "3h" },
                                { name: "6 horas", value: "6h" },
                                { name: "12 horas", value: "12h" },
                                { name: "1 día", value: "1d" },
                                { name: "3 días", value: "3d" },
                                { name: "1 semana", value: "1w" },
                                { name: "2 semanas", value: "2w" },
                                { name: "1 mes", value: "1M" },
                                { name: "3 meses", value: "3M" },
                                { name: "6 meses", value: "6M" },
                                { name: "1 año", value: "1y" }
                            ]
                        },
                        {
                            name: "silent",
                            description: "Aplica el timeout sin enviar un mensaje al canal de texto",
                            type: ApplicationCommandOptionType.Boolean,
                            required: false,
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "Quita un timeout a un usuario",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "target",
                            description: "Usuario al que se le quitara el timeout",
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        },
                        {
                            name: "reason",
                            description: "Razón por la que se quitara el timeout",
                            type: ApplicationCommandOptionType.String,
                            required: false
                        },
                        {
                            name: "silent",
                            description: "Quita el timeout sin enviar un mensaje al canal de texto",
                            type: ApplicationCommandOptionType.Boolean,
                            required: false,
                        }
                    ]
                }

            ],
            dev: true,
            dm_permissions: false,
            cooldown: 3
        })
    }
}