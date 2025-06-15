import { BotClient } from "@/bot/BotClient.js";

export class PrefixCommand {
    private type: "prefix" = "prefix";
    private _name?: string;
    private _description?: string;
    private _execute?: (client: BotClient, message: any) => Promise<void>;

    setName(name: string): this {
        this._name = name;
        return this;
    }

    setDescription(description: string): this {
        this._description = description;
        return this;
    }

    setExecute(execute: (client: any, message: any) => Promise<void>): this {
        this._execute = execute;
        return this;
    }

    public get name() {
        return this._name;
    }
    public get description() {
        return this._description;
    }
    public get execute() {
        return this._execute;
    }
    public get getType() {
        return this.type;
    }

    toJSON() {
        if (!this._name) {
            throw new Error("Command name is required");
        }

        if (!this._description) {
            throw new Error("Command description is required");
        }

        if (!this._execute) {
            throw new Error("Command execute function is required");
        }

        if (typeof this._execute !== 'function') {
            throw new Error("Command execute must be a function");
        }

        return {
            name: this._name,
            description: this._description,
        };
    }
}