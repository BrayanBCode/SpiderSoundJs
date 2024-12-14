import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";

export default new Command({
    data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Detiene y borra la cola de reprodución"),
    execute: async (client, interaction) => {

    }
})