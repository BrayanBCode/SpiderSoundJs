import { Client, ClientEvents } from "discord.js";
import { BotClient } from "./BotClient";


export abstract class BaseDiscordEvent {
    /**
     * Nombre del evento de Discord.
     */
    abstract name: keyof ClientEvents;

    /**
     * Determina si el evento se ejecuta solo una vez.
     */
    abstract once: boolean;

    /**
     * Método que se ejecutará cuando se dispare el evento.
     */
    abstract execute(client: BotClient, ...args: any[]): void;
}
