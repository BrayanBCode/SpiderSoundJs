import type { ButtonInteraction, ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions } from "discord.js";
import { createEmptyEmbed, replyEmbed } from "../../utils/tools";

export type interactionCommandType =
    | ChatInputCommandInteraction<"cached">

export interface ISimpleEmbedReply {
    interaction: ChatInputCommandInteraction<"cached"> | ButtonInteraction<"cached">;
    embed?: EmbedBuilder;
    ephemeral?: boolean;
    options?: InteractionReplyOptions
    followUp?: boolean;

}

export async function warnNoChannelAcces(inter: interactionCommandType) {
    return await replyEmbed({
        interaction: inter,
        embed: createEmptyEmbed({ description: "❌| No puedo unirme o reproducir en este canal" }).setColor("Red"),
        ephemeral: true
    })
}

export async function warnJoinToVC(inter: interactionCommandType) {
    return await replyEmbed({
        interaction: inter,
        embed: createEmptyEmbed({ description: "⚠️| Unete a un canal de voz" }).setColor("Yellow"),
        ephemeral: true
    });
}

export async function warnNothingFound(inter: interactionCommandType) {
    return await replyEmbed({
        interaction: inter,
        embed: createEmptyEmbed({ description: "⚠️| No se encontraron resultados" }).setColor("Yellow"),
        ephemeral: true
    })
}

export async function warnJoinToVCBut(inter: interactionCommandType) {
    return await replyEmbed({
        interaction: inter,
        embed: createEmptyEmbed({ description: "⚠️| Te uniste al canal de voz, vuelve a ejecutar el comando, por favor.." }).setColor('Yellow'),
        ephemeral: true
    })
}

export async function warnNeedSameVC(inter: interactionCommandType) {
    return await replyEmbed({
        interaction: inter,
        embed: createEmptyEmbed({ description: "⚠️| Necesitas estar en el mismo canal que yo" }).setColor("Yellow"),
        ephemeral: true
    })
}

export async function errorNoMatchesFounded(inter: interactionCommandType) {
    return replyEmbed({
        interaction: inter,
        embed: createEmptyEmbed({ description: "❌| No se encontraron resultados" }).setColor("Red"),
        ephemeral: true
    });
}

