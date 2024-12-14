import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";

export default new Command({
    data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Me desconecta del canal de voz"),
    execute: async (client, interaction) => {

    }
})