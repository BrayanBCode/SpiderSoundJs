import { Client } from "discord.js";
import ISpiderPlayer from "../../interfaces/ISpiderPlayer/ISpiderPlayer";
import Guild_player from "./Guild_player";
import IGuild_player_Options from "../../interfaces/ISpiderPlayer/IGuild_player_Options";

export default class SpiderPlayer implements ISpiderPlayer {
    guilds: Map<string, Guild_player>;
    client: Client<boolean>;

    constructor(client: Client<boolean>) {
        this.guilds = new Map();
        this.client = client;
    }

    create_player(guild_id: string, options: IGuild_player_Options) {
        const guild_player = new Guild_player(guild_id, {
            client: this.client,
            loop: options.loop,
            deaf: options.deaf
        })
        this.guilds.set(guild_id, guild_player);

        return guild_player
    }
    get_player(guild_id: string) {
        return this.guilds.get(guild_id);
    }

    destroy_player(guild_id: string) {
        this.guilds.delete(guild_id);
    }
    
}