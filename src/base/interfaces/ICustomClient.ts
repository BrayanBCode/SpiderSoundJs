import { Collection } from "discord.js";
import { IConfig } from "./IConfig";
import Command from "../classes/Command";
import SubCommand from "../classes/SubCommand";
import { Poru } from "poru";

export default interface ICustomClient {
    config: IConfig
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    developmentMode: boolean;
    developerUserIDs: Array<string>;
    poru: Poru | null;

    Init(): void;
    LoadHandlers(): void;
}

