import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { BaseDiscordEvent } from "@/structures/events/BaseDiscordEvent.js";
import { EmptyEmbed } from "@/utils/tools.js";
import { Guild, TextChannel } from "discord.js";

export default class OnGuildJoin extends BaseDiscordEvent<"guildCreate"> {
    name: "guildCreate" = "guildCreate";
    execute(client: BotClient, guild: Guild): void | Promise<void> {

        const channel = guild.systemChannel ?? guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(guild.members.me!).has("SendMessages")) as TextChannel;

        if (!channel) {
            logger.warn(`[OnGuildJoin] No puedo encontrar un canal de texto en el servidor ${guild.name} (${guild.id}) para enviar el mensaje de bienvenida.`);
            return;
        }

        channel.send({
            embeds: [
                EmptyEmbed()
                    .setTitle(`¡Hola, ${guild.name}!`)
                    .setDescription(`Gracias por invitarme a tu servidor.\n\n` +
                        `Puedes usar \`/help\` para ver una lista de mis comandos.\n\n` +
                        `Estoy en desarrollo y no tengo servicio 24/7, pero puedes seguir mi progreso en mi servidor de soporte.\n\n` +
                        `Enlaces: \n- [SpiderSoundJS](https://github.com/BrayanBCode/SpiderSoundJs)  |  [Soporte](https://discord.gg/dYMWGHbgNJ)`
                    )
                    .setColor("NotQuiteBlack")

            ]
        })


    }

}