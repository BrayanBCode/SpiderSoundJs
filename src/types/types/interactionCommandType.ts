import { ButtonInteraction, CacheType, ChannelSelectMenuInteraction, ChatInputCommandInteraction, MentionableSelectMenuInteraction, RoleSelectMenuInteraction, StringSelectMenuInteraction, UserSelectMenuInteraction } from "discord.js";

export type interactionCommandType =
    | ChatInputCommandInteraction<"cached">

// export type interactionButtonType =
//     | ButtonInteraction<CacheType>
//     | StringSelectMenuInteraction<CacheType>
//     | UserSelectMenuInteraction<CacheType>
//     | RoleSelectMenuInteraction<any>
//     | MentionableSelectMenuInteraction<any>
//     | ChannelSelectMenuInteraction<any>

export type interactionButtonType =
    | ButtonInteraction<"cached">
    | StringSelectMenuInteraction<"cached">
    | UserSelectMenuInteraction<"cached">
// | RoleSelectMenuInteraction<any>
// | MentionableSelectMenuInteraction<any>
// | ChannelSelectMenuInteraction<any>

