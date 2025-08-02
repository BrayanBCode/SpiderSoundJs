import { PrefixCommand } from "./PrefixCommand.js";

export class WithOutPrefix extends PrefixCommand {
    public type: string = "without_prefix";
    private _aliases: string[] = [this.name!];
    private _startWithName: boolean = true;

    setAliases(aliases: string[]): this {
        this._aliases = [this.name!];
        this._aliases.push(...aliases);
        return this;
    }
    setStartWithName(startWithName: boolean): this {
        this._startWithName = startWithName;
        return this;
    }

    public get aliases() {
        return this._aliases;
    }
    public get startWithName() {
        return this._startWithName;
    }

    toJSON() {
        if (!this.name) {
            throw new Error("Command name is required");
        }

        if (!this.description) {
            throw new Error("Command description is required");
        }

        if (!this.execute) {
            throw new Error("Command execute function is required");
        }

        if (typeof this.execute !== 'function') {
            throw new Error("Command execute must be a function");
        }

        return {
            name: this.name,
            description: this.description,
            aliases: this.aliases.slice(1),
        };
    }
}

