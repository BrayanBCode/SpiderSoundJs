import { ClientEvents } from "discord.js";
import { BotClient } from "../../class/BotClient.js";
import { BaseDiscordEvent } from "../../class/events/BaseDiscordEvent.js";
import { config } from "../../config/config.js";
import { lavaManagerCustom } from "../../class/lavaManagerCustom.js";
import { registerAllCommands } from "../../handler/CommandsDeployer.js";
import { registerDiscordEvents } from "../../handler/DiscordEventDeployer.js";
import { loadLavalinkEvents } from "../../handler/LavalinkEventDeployer.js";

export default class ReadyEvent extends BaseDiscordEvent<"ready"> {
    name: "ready" = "ready";
    once: boolean = false;

    async execute(client: BotClient) {
        console.log(`¡Bot ${client.user?.tag} está listo y conectado!`);
        await this.initializeLavaManager(client)
        await registerAllCommands(client);
        await loadLavalinkEvents(client);
    }


    async initializeLavaManager(client: BotClient) {
        try {
            console.log("Iniciando conexión con Lavalink...");

            client.lavaManager = new lavaManagerCustom({
                nodes: [
                    {
                        authorization: config.lavalink.authorization,
                        host: config.lavalink.host,
                        port: config.lavalink.port,
                        id: config.bot.user,
                    },
                ],
                sendToShard: (guildId, payload) =>
                    client.guilds.cache.get(guildId)?.shard?.send(payload),
            });

            await client.lavaManager.init({
                id: config.bot.clientID,
                username: client.user?.tag

            }).catch((err) => {
                console.error("Error al iniciar LavaManager:", err);
            })

            console.log("LavaManager inicializado.");
        } catch (err) {
            console.error("Error al inicializar LavaManager:", err);
        }
    }

}
