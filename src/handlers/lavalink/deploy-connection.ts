import { LavalinkManager } from "lavalink-client";
import { config } from "../../config/config.js";
import { BotClient } from "../../class/BotClient.js";


export async function deploylavalinkConnection(client: BotClient) {
    const lavalinkManager = new LavalinkManager({
        nodes: [
            {
                authorization: config.lavalink.authorization,
                host: config.lavalink.host,
                port: config.lavalink.port,
                id: "SiFunco",

            },
        ],
        sendToShard: (guildId, payload) =>
            client.guilds.cache.get(guildId)?.shard?.send(payload),
    });

    client.lavalink = lavalinkManager;
}
