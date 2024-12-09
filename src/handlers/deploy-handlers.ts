import { deployClientEvents } from "./client/discord-events.js";
import { deploylavalinkConnection } from "./lavalink/deploy-connection.js";
import { deployLavalinkEvents } from "./lavalink/deploy-events.js";

import { BotClient } from "../class/BotClient.js";
import { deployAllCommands } from "./commands/deploy-commands.js";

export function deployEvents(client: BotClient) {
    console.log("|| Inicializando LavaLink ||");
    deploylavalinkConnection(client)
        .then((result) => {
            deployLavalinkEvents(client);
            deployClientEvents(client);
        })
        .catch((err) => {
            console.error(err);
        });
    console.log("|| Obteniendo Comandos ||");
    deployAllCommands(client);
}
