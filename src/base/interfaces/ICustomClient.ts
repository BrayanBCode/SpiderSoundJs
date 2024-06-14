import { Collection } from "discord.js";
import { IConfig } from "./IConfig";
import Command from "../classes/Command";
import SubCommand from "../classes/SubCommand";

export default interface ICustomClient {
    config: IConfig
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    developmentMode: boolean;

    Init(): void;
    LoadHandlers(): void;
}

