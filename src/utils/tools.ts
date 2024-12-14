import { EmbedBuilder } from "discord.js";
import { BotClient } from "../class/BotClient";

export function getPlayer(client: BotClient, guildId: string) {
    return client.lavaManager!.getPlayer(guildId)
}

export function createEmbedTemplate() {
    return new EmbedBuilder()
}
