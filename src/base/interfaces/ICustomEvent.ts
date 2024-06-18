import CustomClient from "../classes/CustomClient";

export default interface ICustomEvent {
    client: CustomClient;
    name: string;
    description: string;
    once: boolean;

    Execute(...args: any): void;
}