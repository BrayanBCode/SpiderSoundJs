import { ChatInputCommandInteraction, CacheType } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";

export default class TestSub2 extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "testsub.2",
        });
    }

    Execute(interaction: ChatInputCommandInteraction<CacheType>): void {
        interaction.reply({ content: "Test subcommand 2", ephemeral: true })
    }
}