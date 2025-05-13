import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";
import { createEmptyEmbed } from "../../utils/tools.js";

export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("help")
            .setDescription("Te dice trola"),

        category: "Misc",

    },
    execute: async (client, interaction) => {
        // Aca es como en java los condicionales llevan () los for igual

        // Responder al comando
        // Discord al llamar a un Slashcommand pide si o si una respuesta por parte del bot o salta error
        await interaction.reply("Tonto")

        // Enviar un mensaje al canal de donde se hizo el comando
        await interaction.channel?.send("Tonto")

        // Enviar un mensaje al canal de donde se hizo el comando con embed
        await interaction.channel?.send({
            content: "Hola we",
            embeds: [
                createEmptyEmbed()
                    .setTitle("Soy un Embed")
                    .setDescription("Soy la descripción compa")
            ]
        })
    }
})