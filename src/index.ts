import { GatewayIntentBits } from "discord.js";
import { BotClient } from "./bot/BotClient.js";

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
