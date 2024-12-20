import { EmbedBuilder } from "discord.js";
import { BotClient } from "../class/BotClient";

export class Tools {

    client: BotClient

    constructor(client: BotClient) {
        this.client = client
    }

    createEmbedTemplate() {
        return new EmbedBuilder()
    }

    getPlayer(guildId: string) {
        return this.client.lavaManager!.getPlayer(guildId)
    }

}

