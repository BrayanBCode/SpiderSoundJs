import { deployClientEvents } from "./client/discord-events.js";
import { deployLavalinkEvents } from "./lavalink/deploy-events.js";

import { BotClient } from "../../src/class/BotClient.js";
import { deployAllCommands } from "./commands/deploy-commands.js";

export function deployEvents(client: BotClient) {
    deployLavalinkEvents(client);
    deployClientEvents(client);
}
