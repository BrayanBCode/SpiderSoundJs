// import { LavalinkManager } from "lavalink-client";
// import { config } from "../../config/config";
// import { BotClient } from "../../class/BotClient";
// import { lavaManagerCustom } from "../../class/lavaManagerCustom";


// export async function deploylavalinkConnection(client: BotClient) {
//     const lavalinkManager = new lavaManagerCustom({
//         nodes: [
//             {
//                 authorization: config.lavalink.authorization,
//                 host: config.lavalink.host,
//                 port: config.lavalink.port,
//                 id: config.bot.user,

//             },
//         ],
//         sendToShard: (guildId, payload) =>
//             client.guilds.cache.get(guildId)?.shard?.send(payload),
//     });
//     client.lavaManager = lavalinkManager;
// }
