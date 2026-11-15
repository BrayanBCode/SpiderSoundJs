import { Guild } from "discord.js";
import { DEvent } from "../../classes/events/DEvent.js";
import { BClient } from "../../client/BClient.js";
import logger from "../../client/logger.js";

/** El bot entró a un servidor nuevo (los que ya tenía al arrancar no disparan este evento) */
export default class GuildCreate extends DEvent<'guildCreate'> {
    constructor() {
        super('guildCreate');
    }

    execute(client: BClient, guild: Guild) {
        logger.info(`[Servidores] Entró a "${guild.name}" (${guild.id}, ${guild.memberCount} miembros, dueño ${guild.ownerId}). Servidores en este shard: ${client.guilds.cache.size}`);
    }
}
