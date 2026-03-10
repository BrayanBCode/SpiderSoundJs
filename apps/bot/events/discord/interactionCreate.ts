import type MusicClient from "@/client/MusicClient";
import { RawEvent } from "@/src/Base/discord/RawEvent";
import { CommandController } from "@/src/Base/discord/SlashCommand";
import type { Interaction, CacheType } from "discord.js";

export default class InteractionCreate extends RawEvent<"interactionCreate"> {
    constructor() {
        super("interactionCreate");
    }

    override async execute(bot: MusicClient, interaction: Interaction<CacheType>): Promise<void> {
        CommandController(bot, interaction);
    }

}