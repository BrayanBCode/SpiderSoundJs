import { ClientEvents } from "discord.js";
import { BotClient } from "../../class/BotClient";

export interface DiscordEvent {
    /**
     * Nombre del evento de Discord (por ejemplo, "ready", "messageCreate").
     */
    name: keyof ClientEvents;

    /**
     * Define si el evento debe utilizar `on` o `once`.
     * - `true` para `once`.
     * - `false` o no definido para `on`.
     */
    once?: boolean;

    /**
     * Método que se ejecuta cuando ocurre el evento.
     * @param client - La instancia personalizada del bot.
     * @param args - Argumentos del evento.
     */
    execute(client: BotClient, ...args: ClientEvents[keyof ClientEvents]): void;
}
