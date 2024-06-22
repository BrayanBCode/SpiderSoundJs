import { Client } from "discord.js";

export default interface IGuild_player_Options {
    client: Client;
    loop: boolean;
    deaf: boolean;
}