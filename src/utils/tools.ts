import { EmbedBuilder, EmbedData, InteractionResponse, MessageFlags } from "discord.js";
import { ISimpleEmbedReply } from "../interface/ISimpleEmbedReply.js";

/**
 * Crea un embed vacío/custom usando las opciones proporcionadas.
 *
 * @param {EmbedData} [opt] - Datos opcionales para inicializar el embed.
 * @returns {EmbedBuilder} Una nueva instancia de EmbedBuilder con las opciones proporcionadas.
 */
export function createEmptyEmbed(opt?: EmbedData) {
    return new EmbedBuilder({ ...opt })
}


/**
 * Envía una respuesta a una interacción con un embed y configuraciones opcionales.
 * Se utiliza para agilizar el envío de respuestas simples y monotonas, suele ser utilizado en conjunto con {@link createEmptyEmbed}.
 * 
 * 
 * @param {ISimpleEmbedReply} params - Los parámetros para la respuesta.
 * @param {Interaction} params.interaction - La interacción a la que se responde.
 * @param {Embed} [params.embed] - El embed a incluir en la respuesta.
 * @param {boolean} [params.ephemeral=false] - Si la respuesta debe ser efímera (solo visible para el usuario).
 * @param {Object} [params.options] - Opciones adicionales para la respuesta.
 *
 * @returns {Promise<Message>} El mensaje que fue enviado como respuesta.
 * 
 * @example
 * simpleEmbedReply(
    interaction: inter,
    embed: createEmptyEmbed({ description: "No se encontraron resultados" }).setColor("Yellow"),
    ephemeral: true
    })
 */
export async function simpleEmbedReply({ interaction, embed, ephemeral = false, options }: ISimpleEmbedReply): Promise<InteractionResponse<true>> {
    if (options) {
        return await interaction.reply({ ...options });
    } else {
        return await interaction.reply({
            embeds: embed ? [embed] : [],
            flags: ephemeral ? MessageFlags.Ephemeral : undefined
        });
    }
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

