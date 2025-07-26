import { InteractionCollector, ButtonInteraction, CacheType, StringSelectMenuInteraction, UserSelectMenuInteraction, RoleSelectMenuInteraction, MentionableSelectMenuInteraction, ChannelSelectMenuInteraction } from "discord.js";
import { APIMessageComponentEmoji, ButtonStyle } from "discord.js"
import { BotClient } from "@/bot/BotClient.js";
import { TextChannel } from "discord.js";
import { Player } from "lavalink-client";


export interface ICustomButtonBuilder {
    custom_id: string
    label: string
    style?: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger
    emoji?: APIMessageComponentEmoji
    disabled?: boolean
}


export type IButtonInteraction =
    | InteractionCollector<
        | ButtonInteraction<CacheType>
        | StringSelectMenuInteraction<CacheType>
        | UserSelectMenuInteraction<CacheType>
        | RoleSelectMenuInteraction<any>
        | MentionableSelectMenuInteraction<any>
        | ChannelSelectMenuInteraction<any>
    >


export interface IPlayerButtons {
    time?: number | undefined;
    player: Player;
    TextChannel: TextChannel;
    client: BotClient;
}