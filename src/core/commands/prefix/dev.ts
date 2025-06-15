import { config } from "@/config/config.js";
import { PrefixCommand } from "@/structures/commands/PrefixCommand.js";
import { MessageFlags } from "discord.js";


export default new PrefixCommand()
    .setName("dev")
    .setDescription("Comandos exclusivos para el Developer.")
    .setExecute(
        async (_client, message) => {
            if (!message.guildId) return;

            if (![config.dev.id].includes(message.author.id)) {
                return await message.reply({
                    content: "Debes ser el Developer del bot para utilizar esta sección de comandos.",
                    flags: MessageFlags.Ephemeral
                });
            }

            await message.reply({
                content: "Comando de prueba ejecutado correctamente.",
                flags: MessageFlags.Ephemeral
            });
        })