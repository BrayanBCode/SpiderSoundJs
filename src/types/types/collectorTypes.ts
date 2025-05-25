import { ButtonInteraction, CacheType, ChannelSelectMenuInteraction, InteractionCollector, MentionableSelectMenuInteraction, RoleSelectMenuInteraction, StringSelectMenuInteraction, UserSelectMenuInteraction } from "discord.js";

export type collectorType =
    | InteractionCollector<
        | ButtonInteraction<CacheType>
        | StringSelectMenuInteraction<CacheType>
        | UserSelectMenuInteraction<CacheType>
        | RoleSelectMenuInteraction<any>
        | MentionableSelectMenuInteraction<any>
        | ChannelSelectMenuInteraction<any>
    >
