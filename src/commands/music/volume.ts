import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";

export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("volume")
            .setDescription("Ajusta el volumen de reprdución")
            .addIntegerOption(o => o
                .setName("vol")
                .setDescription("Volumen entre 1 y 100")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
            ),
        category: 'Music'
    },
    execute: async (client, interaction) => {

    }
})