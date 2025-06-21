import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { config } from "@/config/config.js";
import { registerLavalinkNodeEvents } from "@/core/handler/RegisterBaseNodeManagerEvents.js";
import { registerPrefixCommands } from "@/core/handler/RegisterPrefixCommands.js";
import { registerSlashCommands } from "@/core/handler/RegisterSlashCommands.js";
import { registerLavalinkEvents } from "@/core/handler/RegisterlavalinkManagerEvent.js";
import { LavaManagerCustom } from "@/lavalink/lavaManagerCustom.js";
import { BaseDiscordEvent } from "@/structures/events/BaseDiscordEvent.js";


/**
 * Evento que se ejecuta cuando el bot ha iniciado y está listo.
 */
export default class ReadyEvent extends BaseDiscordEvent<"ready"> {
    name: "ready" = "ready";

    /**
     * Ejecutado cuando el bot está completamente listo.
     * Registra comandos, eventos de Lavalink y establece la conexión con LavaManager.
     *
     * @param client Cliente del bot.
     */
    async execute(client: BotClient) {
        logger.info(`¡Bot ${client.user?.tag} está listo y conectado!`);

        // Ejecuta todas las tareas de inicialización de forma paralela
        await Promise.all([
            this.initializeLavaManager(client),       // Conecta con el servidor Lavalink
            registerSlashCommands(client),            // Registra todos los comandos slash disponibles
            registerPrefixCommands(client),           // Registra todos los comandos prefix disponibles
            registerLavalinkEvents(client),           // Registra eventos personalizados para Lavalink
            registerLavalinkNodeEvents(client)        // Registra eventos base del nodo Lavalink
        ]);
    }

    /**
     * Inicializa LavaManager para gestionar la reproducción de música.
     * Establece conexión con el servidor Lavalink, define opciones y registra el evento `raw`.
     * 
     * @param client Cliente del bot.
     */
    async initializeLavaManager(client: BotClient) {
        try {
            logger.info("[Ready Event] Iniciando conexión con Lavalink...");

            // Crea una nueva instancia de LavaManagerCustom con configuración personalizada
            client.lavaManager = new LavaManagerCustom({
                nodes: [
                    {
                        authorization: config.lavalink.authorization,  // Token de autenticación
                        host: config.lavalink.host,                    // Dirección del servidor
                        port: config.lavalink.port,                    // Puerto del servidor
                        id: config.lavalink.id,                        // Identificador del nodo, se utiliza el clienteID del bot
                    },
                ],
                autoSkip: true, // Hace que las canciones se salten automáticamente si fallan

                playerOptions: {
                    defaultSearchPlatform: "ytsearch", // Plataforma de búsqueda por defecto
                    onDisconnect: {
                        autoReconnect: true,           // Reconecta automáticamente si se pierde la conexión
                    }
                },

                // Método para enviar datos al shard correcto
                sendToShard: (guildId, payload) =>
                    client.guilds.cache.get(guildId)?.shard?.send(payload),
            });

            // Inicializa la conexión con Lavalink
            await client.lavaManager.init({
                id: config.bot.clientID,
                username: client.user?.tag
            }).catch((err) => {
                logger.error("[Ready Event] Error al iniciar LavaManager:", err);
            });

            // Registra el evento "raw" de Discord para enviar datos a Lavalink
            logger.info("|| Evento Raw Cargado ||");
            client.on("raw", (d) => {
                return client.lavaManager.sendRawData(d)
            });

            logger.info("[Ready Event] LavaManager inicializado.");
        } catch (err) {
            logger.error("[Ready Event] Error al inicializar LavaManager:", err);
        }
    }
}
