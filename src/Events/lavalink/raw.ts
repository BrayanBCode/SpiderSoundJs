import { BotClient } from "../../class/BotClient.js";
import { BaseLavalinkEvent } from "../../class/events/BaseLavalinkEvent.js";

export default class sendRawData extends BaseLavalinkEvent<"raw"> {
    name: "raw" = "raw";
    once: boolean = false;
    execute(client: BotClient, d: any): void {
        client.lavaManager.sendRawData(d)
    }

}
