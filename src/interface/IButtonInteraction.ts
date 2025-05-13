import { InteractionCollector, ButtonInteraction, CacheType, StringSelectMenuInteraction, UserSelectMenuInteraction, RoleSelectMenuInteraction, MentionableSelectMenuInteraction, ChannelSelectMenuInteraction } from "discord.js";

export type IButtonInteraction =
    | InteractionCollector<
        | ButtonInteraction<CacheType>
        | StringSelectMenuInteraction<CacheType>
        | UserSelectMenuInteraction<CacheType>
        | RoleSelectMenuInteraction<any>
        | MentionableSelectMenuInteraction<any>
        | ChannelSelectMenuInteraction<any>
    >
