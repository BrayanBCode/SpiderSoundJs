import { Client } from "discord.js";
import Guild_player from "../../classes/SpiderPlayer/Guild_player";
import IGuild_player_Options from "./IGuild_player_Options";

export default interface ISpiderPlayer {
    guilds: Map<string, Guild_player>;
    client: Client;

    create_player(guild_id: string, options: IGuild_player_Options): any;
    get_player(guild_id: string): any;
}