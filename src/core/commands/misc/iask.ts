import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { ChatInputCommandInteraction } from "discord.js";

export default new SlashCommand()
    .setName("iask")
    .setDescription("Respuesta generada por la IA")
    .setCategory("Misc")
    .setExecute(
        async (_client, interaction: ChatInputCommandInteraction) => {
            await interaction.deferReply();

            const ask = interaction.options.getString("pregunta", true); // `true` lo hace obligatorio (evita el if manual)

            const prompt = `${ask}, en menos de 2000 letras`;

            try {
                const response = await fetch(`https://gemini-rest.vercel.app/api/?prompt=${encodeURIComponent(prompt)}`);

                if (!response.ok) {
                    throw new Error(`API Error: ${response.statusText}`);
                }

                const data = await response.json();

                if (!data?.response) {
                    throw new Error("Respuesta de la IA inválida o vacía.");
                }

                await interaction.followUp(data.response.substring(0, 2000));
            } catch (error) {
                console.error("Error en el comando /iask:", error);
                await interaction.followUp("❌ Hubo un error al procesar tu pregunta. Intenta nuevamente más tarde.");
            }
        }
    )
    .addStringOption(option =>
        option
            .setName("pregunta")
            .setDescription("¿Qué te pinta preguntar, che?")
            .setRequired(true)
    );
