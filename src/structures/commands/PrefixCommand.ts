import { TCommandCategoryOptions } from "@/types/types/TCategoryOptions.js";
import { PrefixCommandExecute } from "@/types/types/TPrefixCommand.js";


export class PrefixCommand {
    public type: string = "prefix";
    private _name?: string;
    private _description?: string;
    private _execute?: PrefixCommandExecute;
    private _category?: string;


    setName(name: string): this {
        this._name = name;
        return this;
    }

    setDescription(description: string): this {
        this._description = description;
        return this;
    }

    setExecute(execute: PrefixCommandExecute): this {
        this._execute = execute;
        return this;
    }
    setCategory(category: TCommandCategoryOptions): this {
        this._category = category;
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
    public get category() {
        return this._category;
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