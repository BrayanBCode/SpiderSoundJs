import { Guild } from "discord.js";
import { DEvent } from "../../classes/events/DEvent.js";
import { BClient } from "../../client/BClient.js";
import logger from "../../client/logger.js";

/** El bot salió de un servidor (lo echaron o se borró el servidor) */
export default class GuildDelete extends DEvent<'guildDelete'> {
    constructor() {
        super('guildDelete');
    }

    execute(client: BClient, guild: Guild) {
        // Una caída de Discord también dispara el evento, con el servidor marcado como no disponible
        if (!guild.available) return void logger.warn(`[Servidores] "${guild.name}" (${guild.id}) quedó no disponible (caída de Discord)`);
        logger.info(`[Servidores] Salió de "${guild.name}" (${guild.id}). Servidores en este shard: ${client.guilds.cache.size}`);
    }
}
