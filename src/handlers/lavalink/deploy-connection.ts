import { LavalinkManager } from "lavalink-client";
import { config } from "../../config/config.js";
import { BotClient } from "../../class/BotClient.js";
import { lavaManagerCustom } from "../../class/lavaManagerCustom.js";


export async function deploylavalinkConnection(client: BotClient) {
    const lavalinkManager = new lavaManagerCustom({
        nodes: [
            {
                authorization: config.lavalink.authorization,
                host: config.lavalink.host,
                port: config.lavalink.port,
                id: config.bot.clientID,

            },
        ],
        sendToShard: (guildId, payload) =>
            client.guilds.cache.get(guildId)?.shard?.send(payload),
    });

    client.lavaManager = lavalinkManager;
}
