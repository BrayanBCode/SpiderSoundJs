import { interactionCommandType } from "@/types/types/interactionCommandType.js";
import { simpleEmbedReply, createEmptyEmbed } from "@/utils/tools.js";
// eafrm


export async function warnNoChannelAcces(inter: interactionCommandType) {
    return await simpleEmbedReply({
        interaction: inter,
        embed: createEmptyEmbed({ description: "No puedo unirme o reproducir en este canal" }),
        ephemeral: true
    })

}

export async function warnJoinToVC(inter: interactionCommandType) {
    return await simpleEmbedReply({
        interaction: inter,
        embed: createEmptyEmbed({ description: "Unete a un canal de voz" }).setColor("Yellow"),
        ephemeral: true
    });
}

export async function warnNothingFound(inter: interactionCommandType) {
    return await simpleEmbedReply({
        interaction: inter,
        embed: createEmptyEmbed({ description: "No se encontraron resultados" }).setColor("Yellow"),
        ephemeral: true
    })

}

export async function warnJoinToVCBut(inter: interactionCommandType) {
    return await simpleEmbedReply({
        interaction: inter,
        embed: createEmptyEmbed({ description: "Te uniste al canal de voz, pero vuelve a ejecutar el comando, por favor.." }).setColor('Yellow'),
        ephemeral: true
    })
}

export async function warnNeedSameVC(inter: interactionCommandType) {
    return await simpleEmbedReply({
        interaction: inter,
        embed: createEmptyEmbed({ description: "Necesitas estar en el mismo canal que yo para agregar/reproducir " }).setColor("Yellow"),
        ephemeral: true
    })

}

export async function errorNoMatchesFounded(inter: interactionCommandType) {
    return simpleEmbedReply({
        interaction: inter,
        embed: createEmptyEmbed({ description: "No se encontraron resultados" }).setColor("Red"),
        ephemeral: true
    });
}

