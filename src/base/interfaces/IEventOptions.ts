import { Events } from "discord.js";

export default interface IHandlerOptions {
    name: Events;
    description: string;
    once: boolean;
}