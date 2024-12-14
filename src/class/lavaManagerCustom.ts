import { Collection, Message } from "discord.js";
import { ManagerOptions } from "lavalink-client/dist/types";
import { LavalinkManager } from "lavalink-client";

export class lavaManagerCustom extends LavalinkManager {

    messages: Collection<String, Message>

    constructor(options: ManagerOptions) {
        super(options)
        this.messages = new Collection()
    }

    getGuildMessage(guildId: string) {
        if (!guildId) return console.error("ID INVALIDO");
        
        return this.messages.get(guildId)
    }

    setGuildMessage(guildId: string, msg: Message) {
        if (!guildId) return console.error("ID INVALIDO");

        this.messages.set(guildId, msg)
    }

    destroyGuildMessage(guildId: string) {
        if (!guildId) return console.error("ID INVALIDO");
        
        this.messages.delete(guildId)
    }
}