import { Collection } from "discord.js";
import { IConfig } from "./IConfig";
import Command from "../classes/Command";
import SubCommand from "../classes/SubCommand";
import { Poru } from "poru";
import SpiderPlayer from "../classes/SpiderPlayer/player";

export default interface ICustomClient {
    config: IConfig
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    developmentMode: boolean;
    developerUserIDs: Array<string>;
    player: SpiderPlayer;

    Init(): void;
    LoadHandlers(): void;
}

