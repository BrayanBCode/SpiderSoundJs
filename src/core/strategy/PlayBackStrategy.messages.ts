import { interactionCommandType } from "../../types/types/interactionCommandType.js";
import { EmptyEmbed, replyEmbed } from "../../utils/messages.js";


export async function warnNoChannelAcces(inter: interactionCommandType) {
    return await replyEmbed({
        interaction: inter,
        embed: EmptyEmbed({ description: "No puedo unirme o reproducir en este canal" }),
        ephemeral: true
    })
}

export async function warnJoinToVC(inter: interactionCommandType) {
    return await replyEmbed({
        interaction: inter,
        embed: EmptyEmbed({ description: "Unete a un canal de voz" }).setColor("Yellow"),
        ephemeral: true
    });
}

export async function warnNothingFound(inter: interactionCommandType) {
    return await replyEmbed({
        interaction: inter,
        embed: EmptyEmbed({ description: "No se encontraron resultados" }).setColor("Yellow"),
        ephemeral: true
    })
}

export async function warnJoinToVCBut(inter: interactionCommandType) {
    return await replyEmbed({
        interaction: inter,
        embed: EmptyEmbed({ description: "Te uniste al canal de voz, pero vuelve a ejecutar el comando, por favor.." }).setColor('Yellow'),
        ephemeral: true
    })
}

export async function warnNeedSameVC(inter: interactionCommandType) {
    return await replyEmbed({
        interaction: inter,
        embed: EmptyEmbed({ description: "Necesitas estar en el mismo canal que yo para agregar/reproducir " }).setColor("Yellow"),
        ephemeral: true
    })
}
