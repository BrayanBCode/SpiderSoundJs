import { Command } from "@/structures/commands/Commands.js";
import { SlashCommandBuilder } from "discord.js";


export default new Command(
    {
        data: {
            command: new SlashCommandBuilder()
                .setName("iask")
                .setDescription("Respuesta generada por la IA")
                .addStringOption(o =>
                    o.setName("pregunta")
                        .setDescription("Que te pinta preguntar che?")
                        .setRequired(true)),
            category: 'Misc'
        },

        execute: async (_client, interaction) => {
            await interaction.deferReply()
            let ask = interaction.options.getString('pregunta');

            if (!ask) return await interaction.reply("No entendi la pregunta")

            ask += ", en menos de 2000 letras"

            const response = await fetch(`https://gemini-rest.vercel.app/api/?prompt=${encodeURIComponent(ask)}`);
            const data = await response.json();


            await interaction.followUp(data.response.substring(0, 2000));
        }
    }
);