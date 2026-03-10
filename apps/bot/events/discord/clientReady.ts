import type MusicClient from "@/client/MusicClient";
import { RawEvent } from "@/src/Base/discord/RawEvent";
import { moonLinkEventHandler } from "@/src/handler/MoonLinkEventHandler";
import logger from "@/utils/logger";
import type { Client } from "discord.js";

export default class clientReady extends RawEvent<"clientReady"> {

    constructor() {
        super("clientReady", true);
    }

    override async execute(bot: MusicClient, client: Client<true>): Promise<void> {
        logger.info(`${bot.user?.displayName || bot.user?.username} is ready!`);
        bot.music = await bot.createServerConnection()

        // Listen to raw events to handle voice state updates for MoonLink
        await moonLinkEventHandler(bot);


    }

}