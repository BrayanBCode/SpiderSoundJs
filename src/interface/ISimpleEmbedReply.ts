import { ButtonInteraction, ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions, MessagePayload } from "discord.js";

export interface ISimpleEmbedReply {
    interaction: ChatInputCommandInteraction<"cached"> | ButtonInteraction<"cached">;
    embed?: EmbedBuilder;
    ephemeral?: boolean;
    options?: InteractionReplyOptions

}