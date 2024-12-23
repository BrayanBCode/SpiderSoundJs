import { ClientEvents } from "discord.js";
import { BotClient } from "../../class/BotClient";
import { BaseDiscordEvent } from "../../class/DiscordEvent.js";

export default class ReadyEvent extends BaseDiscordEvent {
    name: keyof ClientEvents = "ready";
    once: boolean = false;

    execute(client: BotClient): void {
        console.log(`¡Bot ${client.user?.tag} está listo y conectado!`);
    }
}
