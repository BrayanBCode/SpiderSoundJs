import { EmbedBuilder, Guild } from "discord.js";
import { DEvent } from "../../classes/events/DEvent.js";
import { BClient } from "../../client/BClient.js";
import { notifyDev } from "../../client/devNotifier.js";
import { updatePresence } from "../../client/presence.js";
import logger from "../../client/logger.js";

/** El bot entró a un servidor nuevo (los que ya tenía al arrancar no disparan este evento) */
export default class GuildCreate extends DEvent<'guildCreate'> {
    constructor() {
        super('guildCreate');
    }

    execute(client: BClient, guild: Guild) {
        logger.info(`[Servidores] Entró a "${guild.name}" (${guild.id}, ${guild.memberCount} miembros, dueño ${guild.ownerId}). Servidores en este shard: ${client.guilds.cache.size}`);
        notifyDev(new EmbedBuilder()
            .setTitle("➕ Entró a un servidor")
            .setColor("Green")
            .setThumbnail(guild.iconURL())
            .setDescription(`**${guild.name}** (\`${guild.id}\`)\n${guild.memberCount} miembros · dueño <@${guild.ownerId}>\nServidores en este shard: **${client.guilds.cache.size}**`));
        updatePresence(client).catch(() => undefined);
    }
}
