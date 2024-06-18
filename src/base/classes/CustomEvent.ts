import ICustomEvent from "../interfaces/ICustomEvent";
import ICustomEventOptions from "../interfaces/ICustomEventOptions";
import CustomClient from "./CustomClient";

export default class CustomEvent implements ICustomEvent {
    client: CustomClient;
    name: string;
    description: string;
    once: boolean;

    constructor(client: CustomClient, options: ICustomEventOptions) {
        this.client = client;
        this.name = options.name;
        this.description = options.description;
        this.once = options.once;
        
    }

    Execute(...args: any): void {
    }

}