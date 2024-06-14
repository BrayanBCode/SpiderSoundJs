import { ChatInputCommandInteraction, CacheType } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import SubCommand from "../../base/classes/SubCommand";

export default class TestSub1 extends SubCommand {
    constructor(client: CustomClient) {
        super(client, {
            name: "testsub.uno",
        });
    }

    Execute(interaction: ChatInputCommandInteraction<CacheType>): void {
        interaction.reply({ content: "Test subcommand 1", ephemeral: true })
    }
}