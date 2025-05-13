import { BotClient } from "../../class/BotClient.js";
import { BaseDiscordEvent } from "../../class/events/BaseDiscordEvent.js";
import { config } from "../../config/config.js";
import { LavaManagerCustom } from "../../class/lavaManagerCustom.js";
import { registerAllCommands } from "../../handler/RegisterCommands.js";
import { registerLavalinkEvents } from "../../handler/RegisterlavalinkManagerEvent.js";
import { registerLavalinkNodeEvents } from "../../handler/RegisterBaseNodeManagerEvents.js";
import logger from "../../class/logger.js";

export default class ReadyEvent extends BaseDiscordEvent<"ready"> {
    name: "ready" = "ready";

    async execute(client: BotClient) {
        logger.info(`¡Bot ${client.user?.tag} está listo y conectado!`);
        await Promise.all([
            this.initializeLavaManager(client),
            registerAllCommands(client),
            registerLavalinkEvents(client),
            registerLavalinkNodeEvents(client)
        ]);
    }


    async initializeLavaManager(client: BotClient) {
        try {
            logger.info("Iniciando conexión con Lavalink...");

            client.lavaManager = new LavaManagerCustom({
                nodes: [
                    {
                        authorization: config.lavalink.authorization,
                        host: config.lavalink.host,
                        port: config.lavalink.port,
                        id: config.bot.user,
                    },
                ],
                autoSkip: true,

                playerOptions: {
                    defaultSearchPlatform: "ytsearch",
                    onDisconnect: {
                        autoReconnect: true,
                    }

                },

                sendToShard: (guildId, payload) =>
                    client.guilds.cache.get(guildId)?.shard?.send(payload),
            });

            await client.lavaManager.init({
                id: config.bot.clientID,
                username: client.user?.tag

            }).catch((err) => {
                logger.error("Error al iniciar LavaManager:", err);
            })

            logger.info("|| Evento Raw Cargado ||");
            client.on("raw", (d) => {
                // logger.debug(d)
                return client.lavaManager.sendRawData(d)
            })

            logger.info("LavaManager inicializado.");
        } catch (err) {
            logger.error("Error al inicializar LavaManager:", err);
        }
    }

}
