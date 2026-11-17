import { ActivityType, Client } from "discord.js";
import logger from "./logger.js";

/**
 * Estado del bot: "Escuchando /play · N servidores". Suma los servidores de todos los shards;
 * si los otros shards todavía no están listos, usa los de este.
 */
export async function updatePresence(client: Client) {
    if (!client.user) return;
    const counts = await client.shard?.fetchClientValues("guilds.cache.size").catch(() => null);
    const total = Array.isArray(counts) ? (counts as number[]).reduce((sum, n) => sum + n, 0) : client.guilds.cache.size;

    client.user.setActivity(`/play · ${total} servidores`, { type: ActivityType.Listening });
    logger.debug(`[Presencia] Estado actualizado: ${total} servidores`);
}
