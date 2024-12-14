import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";

export default new Command({
    data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Mezcla las canciones de la cola de reprodución"),
    execute: async (client, interaction) => {

    }
})