import { ApplicationCommandOptionType, CacheType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command";
import CustomClient from "../base/classes/CustomClient";
import Category from "../base/enums/Category";

export default class TestSub extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "testsub",
            description: "Test subcommands",
            category: Category.Utilities,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            dm_permissions: false,
            cooldown: 3,
            dev: true,
            options: [
                {
                    name: "1",
                    description: "Test option 1",
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: "2",
                    description: "Test option 2",
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ]
        });
    }

}