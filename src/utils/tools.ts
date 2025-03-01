import { EmbedBuilder, Guild } from "discord.js";
import { BotClient } from "../class/BotClient.js";

export class Tools {

    client: BotClient

    constructor(client: BotClient) {
        this.client = client
    }

    createEmbedTemplate() {
        return new EmbedBuilder()
    }

    getPlayer(guildId: string) {
        return this.client.lavaManager.getPlayer(guildId)
    }

    getGuild(guildId: string) {
        return this.client.guilds.cache.get(guildId) as Guild
    }

}

