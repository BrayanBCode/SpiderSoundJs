import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { config } from "@/config/config.js";
import { registerPrefixCommands } from "@/core/handler/RegisterPrefixCommands.js";
import { registerSlashCommands } from "@/core/handler/RegisterSlashCommands.js";
import { registerLavalinkEvents } from "@/core/handler/RegisterlavalinkManagerEvent.js";
import { registerWithOutPrefixCommands } from "@/core/handler/RegisterWithOutPrefixCommands.js";
import { BaseDiscordEvent } from "@/structures/events/BaseDiscordEvent.js";
import { ActivityType, Client } from "discord.js";
import { INode, Manager } from "moonlink.js";


/**
 * Evento que se ejecuta cuando el bot ha iniciado y está listo.
 */
export default class ReadyEvent extends BaseDiscordEvent<"ready"> {
    name: "ready" = "ready";

    /**
     * Ejecutado cuando el bot está completamente listo.
     * Registra comandos, eventos de Lavalink y establece la conexión con manager.
     *
     * @param client Cliente del bot.
     */
    async execute(client: BotClient) {
        logger.info(`¡Bot ${client.user?.tag} está listo y conectado!`);

        stablishActivity(client);                     // Establece la actividad del bot
        await this.initializeLavaManager(client);     // Conecta con el servidor Lavalink

        // Ejecuta todas las tareas de inicialización de forma paralela
        await Promise.all([
            registerSlashCommands(client),            // Registra todos los comandos slash disponibles
            registerPrefixCommands(client),           // Registra todos los comandos prefix disponibles
            registerLavalinkEvents(client),           // Registra eventos personalizados para Lavalink
            registerWithOutPrefixCommands(client),    // Registra comandos sin prefijo
            // Inabilitado por falta de uso
            // registerLavalinkNodeEvents(client)        // Registra eventos base del nodo Lavalink
        ]);
    }

    /**
     * Inicializa manager para gestionar la reproducción de música.
     * Establece conexión con el servidor Lavalink, define opciones y registra el evento `raw`.
     * 
     * @param client Cliente del bot.
     */
    async initializeLavaManager(client: BotClient) {
        try {
            logger.info("[Ready Event] Iniciando conexión con Lavalink...");

            await stablishLavalinkConnection(client); // Establece la conexión con Lavalink
            onRaw(client);                            // Registra el evento `raw` para enviar datos a Lavalink

            logger.info("[Ready Event] Conexión con Lavalink establecida correctamente.");
        } catch (err) {
            logger.error("[Ready Event] Error al inicializar manager:", err);
        }
    }
}


/**
 * Establece la conexión con el servidor Lavalink y configura el manager.
 * 
 * @param client Cliente del bot.
 */
async function stablishLavalinkConnection(client: BotClient) {
    // Crea una nueva instancia de Manager con configuración personalizada
    client.manager = new Manager({
        nodes: [
            {
                password: config.lavalink.authorization,  // Token de autenticación
                host: config.lavalink.host,                    // Dirección del servidor
                port: config.lavalink.port,                    // Puerto del servidor
                identifier: config.lavalink.id,                        // Identificador del nodo, se utiliza el clienteID del bot
            },
        ],
        options: { disableNativeSources: true },
        // Método para enviar datos al shard correcto
        sendPayload: (guildId: string, payload: any) => {
            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(JSON.parse(payload));
        }
    });

    client.manager.init(config.bot.clientID);

}


/**
 * Registra el evento "raw" de Discord para enviar datos a Lavalink
 */
function onRaw(client: BotClient) {
    logger.info("|| Evento Raw Cargado ||");
    client.on("raw", (payload) => {
        client.manager.packetUpdate(payload);
    });

}


function stablishActivity(client: BotClient) {
    client.user!.setActivity({
        name: `${client.guilds.cache.size} servidores`,
        type: ActivityType.Watching,
        url: "https://github.com/BrayanBCode/SpiderSoundJs"
    });
}