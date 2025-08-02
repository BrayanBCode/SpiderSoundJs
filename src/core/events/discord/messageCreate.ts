import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { config } from "@/config/config.js";
import { PrefixCommandContext } from "@/structures/commands/PrefixCommandContext.js";
import { WithOutPrefix } from "@/structures/commands/WithOutPrefix.js";
import { BaseDiscordEvent } from "@/structures/events/BaseDiscordEvent.js";
import { createEmptyEmbed } from "@/utils/tools.js";
import { OmitPartialGroupDMChannel, Message } from "discord.js";

/**
 * Evento que se dispara cuando se crea un mensaje en un canal.
 * Este evento maneja los mensajes de texto y verifica si son comandos del bot.
 */
export default class MessageCreate extends BaseDiscordEvent<"messageCreate"> {
    name: "messageCreate" = "messageCreate";
    execute(client: BotClient, message: OmitPartialGroupDMChannel<Message<boolean>>): void | Promise<void> {

        if (!message.content || !message.author.bot) return;

        // Prefix Command Context (PreCC)
        const PreCC = new PrefixCommandContext(client, message);
        const args = message.content
            .slice(config.bot.prefix.length + PreCC.cmdName.length)
            .trim()
            .split(/ +/);

        // Ignora mensajes de bots
        if (message.author.bot) return;

        // Verifica si el mensaje comienza con el prefijo del bot
        if (!message.content.startsWith(config.bot.prefix)) {
            for (const [_, cmd] of client.withOutPrefixCommands) {

                for (const aliase of cmd.aliases) {

                    if (message.content.includes(aliase.toLocaleLowerCase())) {

                        if (cmd.startWithName && !message.content.startsWith(aliase.toLocaleLowerCase())) {
                            return;
                        }

                        cmd.execute!(client, PreCC, args);
                    }
                }
            }
        }

        if (PreCC.cmdType === "withOutPrefix") {
            return;
        }

        if (!PreCC.cmdName) {
            message.reply({
                embeds: [
                    createEmptyEmbed()
                        .setDescription("No se encontró un comando en el mensaje. Asegúrate de que el mensaje comience con el prefijo del bot.")
                        .setColor("Red")
                        .setFooter({ text: `Prefijo actual: ${config.bot.prefix}` })
                ],
            });
            logger.warn(`[MessageCreate] No command name found in message: ${message.content}`);
            return;
        }

        // Prefix Command
        const PreCmd = client.prefixCommands.get(PreCC.cmdName);

        if (!PreCmd) {
            message.reply({
                embeds: [createEmptyEmbed()
                    .setDescription(`El comando \`${PreCC.cmdName}\` no existe o no está registrado.`)
                    .setColor("Red")
                    .setFooter({ text: `Prefijo actual: ${config.bot.prefix}` })
                ],
            });

            logger.warn(`[MessageCreate] Command not found: ${PreCC.cmdName}`);
            return;
        }

        PreCmd.execute!(client, PreCC, args)

    }

}