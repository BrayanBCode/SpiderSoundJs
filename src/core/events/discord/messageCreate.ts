import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { config } from "@/config/config.js";
import { BaseDiscordEvent } from "@/structures/events/BaseDiscordEvent.js";
import { OmitPartialGroupDMChannel, Message } from "discord.js";

/**
 * Evento que se dispara cuando se crea un mensaje en un canal.
 * Este evento maneja los mensajes de texto y verifica si son comandos del bot.
 */
export default class MessageCreate extends BaseDiscordEvent<"messageCreate"> {
    name: "messageCreate" = "messageCreate";
    execute(client: BotClient, message: OmitPartialGroupDMChannel<Message<boolean>>): void | Promise<void> {
        // Ignora mensajes de bots
        if (message.author.bot) return;

        // Verifica si el mensaje comienza con el prefijo del bot
        if (!message.content.startsWith(config.bot.prefix)) return;


    }

}