import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";

export default new Command({
    data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Reanuda la reprdución de musica")
    ,
    execute: async (client, interaction) => {

    }
})