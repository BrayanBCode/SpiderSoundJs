import { Client, GatewayIntentBits } from "discord.js";
import { config } from "./config/config.js";
import { deployEvents } from "./handlers/deploy-handlers.js";
import { BotClient } from "./class/BotClient.js";

const client = new BotClient(
    {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            
        ],
        debugMode: false
    }
);

client.init();
