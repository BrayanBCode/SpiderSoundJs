import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { Command } from "../../class/Commands.js";
import { config } from "../../config/config.js";
import https from "https";

export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("dev")
            .setDescription("Comandos exclusivos para el Developer..")
            .setDefaultMemberPermissions(0)
            .addStringOption(o =>
                o.setName("opcion") // 🔹 Cambiado de "minecraft" a "opcion"
                    .setDescription("Selecciona una opción.")
                    .setRequired(true)
                    .addChoices(
                        { name: "Verify IP", value: "verify" },
                        { name: "Send server start message", value: "start" },
                        { name: "Test Paginator", value: "paginator" }
                    )
            ),
        category: "Dev"
    },
    execute: async (client, interaction) => {
        if (!interaction.guildId) return;

        if (interaction.user.id !== config.dev.id) {
            return await interaction.reply({
                content: "Debes ser el Developer del bot para utilizar esta sección de comandos.",
                flags: MessageFlags.Ephemeral
            });
        }

        const opcion = interaction.options.getString("opcion"); // 🔹 Ahora coincide con el `setName("opcion")`


        if (opcion === "verify") {
            await interaction.deferReply();

            verifyMsg(interaction);
        } else if (opcion === "start") {
            await interaction.deferReply();

            start(interaction);
        } else if (opcion === "paginator") {
            // Aquí va el código del Paginator
            const embeds: EmbedBuilder[] = [];

            for (let i = 0; i < 4; i++) {
                embeds.push(new EmbedBuilder().setTitle(`Página ${i + 1}`).setDescription("Contenido de la página"));
            }

            // await Paginator({ interaction, pages: embeds })

        } else {
            await interaction.followUp({
                content: "Opción inválida.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
});

function verifyMsg(interaction: ChatInputCommandInteraction) {
    getPublicIP()
        .then(async (ip) => {
            await interaction.followUp({
                embeds: [
                    new EmbedBuilder().setTitle("IP Pública").setDescription(`|| ${ip} ||`)
                ],
                flags: MessageFlags.Ephemeral
            });
        })
        .catch(async (err) => {
            await interaction.followUp({
                content: `Error al obtener la IP: ${err.message}`,
                flags: MessageFlags.Ephemeral
            });
        });
}

async function getPublicIP(): Promise<string> {
    return new Promise((resolve, reject) => {
        https.get("https://api64.ipify.org?format=json", (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                try {
                    const ip = JSON.parse(data).ip;
                    resolve(ip);
                } catch (error) {
                    reject(new Error("Error al parsear la respuesta"));
                }
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
}

async function start(interaction: ChatInputCommandInteraction) {
    try {
        const ip = await getPublicIP();
        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Create 2.0")
                    .setDescription(`Se prendió el server negros\n\nIP: || ${ip} ||\nPuerto: || 25565 ||\nConectarse: || ${ip}:25565  ||\n\n<@&1346850916833169568>`)
                    .setColor(2316821)
                    .setImage("https://media1.tenor.com/m/kTCpOtE7zBoAAAAd/cat-blinking.gif")
                    .setTimestamp(),
            ],
        });
    } catch (error) {
        await interaction.followUp({
            content: `Error al obtener la IP: ${error}`,
            flags: MessageFlags.Ephemeral
        });
        console.error("Cagamo:", error);
    }
}
