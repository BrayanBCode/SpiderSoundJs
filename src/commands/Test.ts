import { CacheType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js"
import Command from "../base/classes/Command"
import CustomClient from "../base/classes/CustomClient"
import Category from "../base/enums/Category"

export default class Test extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: "test",
            description: "Test command",
            category: Category.Utilities,
            options: [],
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            dm_permissions: false,
            cooldown: 10,
            dev: true
        });
    }

    Execute(interaction: ChatInputCommandInteraction<CacheType>): void {
        interaction.reply({ content: "Test command", ephemeral: true })
        console.log(interaction.guild?.iconURL({ size: 64 }));

    }


}