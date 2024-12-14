import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";

export default new Command({
    data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pausa la reprodución de musica"),
    execute: async (client, interaction) => {

    }
})