import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import type { Player, Track } from "moonlink.js";
import logger from "../client/logger.js";
import type { BClient } from "../client/BClient.js";
import { ISimpleEmbedReply } from "../../types/interface/ISimpleEmbedReply.js";
import { deleteAfterTimer, EmptyEmbed, replyEmbed } from "../../utils/messages.js";
import { formatMS_HHMMSS } from "../../utils/tools.js";

// Helpers del reproductor: comprobaciones de oyente, salto, seek y datos de la canción.

/**
 * Responde (efímero, se borra a los 15 s) que no hay un player activo en el servidor.
 */
export async function replyNoPlayer(interaction: ISimpleEmbedReply["interaction"]) {
    const source = interaction.isButton() ? `botón ${interaction.customId}` : `/${interaction.commandName}`;
    logger.debug(`[NoPlayer] ${interaction.user.username} usó ${source} sin player activo en ${interaction.guild?.name}`);
    return deleteAfterTimer(await replyEmbed({
        interaction,
        embed: EmptyEmbed()
            .setDescription("❌ | No hay nada reproduciéndose.")
            .setColor("Red"),
        ephemeral: true,
    }), 15000);
}


/**
 * Nombre y avatar de quien pidió una canción.
 *
 * Normalmente `track.requester` es un `User` de discord.js, pero cuando moonlink
 * restaura una sesión (reinicio del bot) vuelve como un objeto plano serializado,
 * sin métodos. Esto lee ambos casos sin romper.
 */
export function getRequesterInfo(requester: any): { name: string; avatar?: string } {
    if (!requester) return { name: "Desconocido" };

    const name = requester.displayName ?? requester.globalName ?? requester.username ?? "Desconocido";
    const avatar = typeof requester.displayAvatarURL === "function"
        ? requester.displayAvatarURL()
        : (typeof requester.displayAvatarURL === "string" ? requester.displayAvatarURL : requester.avatarURL ?? undefined);

    return { name, avatar };
}

/**
 * Salta a la canción en `position` de la cola respetando el loop de cola.
 *
 * moonlink solo vuelve a encolar la canción actual cuando termina sola; al saltar
 * (trackEnd "replaced") no lo hace, así que con loop de cola la canción saltada
 * desaparecía de la rotación. Acá se re-encola al final antes de saltar.
 *
 * @returns la canción que pasa a sonar, o `undefined` si no hay nada en esa posición
 */
export async function skipTrack(player: Player, position = 0): Promise<Track | undefined> {
    if (player.loop === "queue" && player.current) {
        player.queue.add(player.current.clone().setPosition(0));
        logger.debug(`[Skip] Loop de cola activo: "${player.current.title}" vuelve al final de la cola`);
    }

    const next = player.queue.get(position);
    if (!next) return undefined;

    await player.skip(position);
    return next;
}


/**
 * Para comandos que controlan la reproducción: devuelve el player si quien lo usa está
 * en el canal de voz del bot. Si no hay player o está en otro canal, responde el error
 * (efímero) y devuelve `undefined`.
 */
export async function requireListener(client: BClient, interaction: ChatInputCommandInteraction<"cached">): Promise<Player | undefined> {
    const player = client.getPlayer(interaction.guildId);
    if (!player) {
        await replyNoPlayer(interaction);
        return undefined;
    }

    if (interaction.member.voice.channelId !== player.voiceChannelId) {
        logger.info(`[Guard] ${interaction.user.username} usó /${interaction.commandName} fuera del canal de voz del bot en ${interaction.guild.name}`);
        deleteAfterTimer(await replyEmbed({
            interaction,
            embed: EmptyEmbed()
                .setDescription("❌ | Debes estar en el canal de voz del bot para usar este comando.")
                .setColor("Red"),
            ephemeral: true,
        }), 15000);
        return undefined;
    }

    return player;
}

/**
 * Mueve la canción actual `deltaMs` milisegundos, sin pasarse del inicio ni del final.
 * @returns la nueva posición en ms
 */
export async function seekRelative(player: Player, deltaMs: number): Promise<number> {
    const position = player.current?.position ?? 0;
    const duration = player.current?.duration;

    let newPos = Math.max(0, position + deltaMs);
    if (duration && newPos >= duration) newPos = duration - 100; // un poquito antes del final

    await player.seek(newPos);
    logger.debug(`[Seek] ${player.guildId}: ${formatMS_HHMMSS(position)} -> ${formatMS_HHMMSS(newPos)}`);
    return newPos;
}


/**
 * Autocompletado de posiciones de la cola (para /skip y /remove): muestra hasta 5 canciones
 * antes y después de la posición que se está escribiendo.
 */
export async function respondQueuePositions(client: BClient, inter: AutocompleteInteraction) {
    const queue = inter.guildId ? client.getPlayer(inter.guildId)?.queue.tracks ?? [] : [];
    if (queue.length === 0) return inter.respond([{ name: "Lista de reproducción vacía", value: -1 }]);

    const pos = Math.min(Math.max(Number(inter.options.getFocused()) || 0, 0), queue.length - 1);
    const range = 5;
    const startIndex = Math.max(0, pos - range);

    return inter.respond(queue.slice(startIndex, pos + range + 1).map((track, i) => ({
        name: `${startIndex + i} - ${track.title}`.slice(0, 100),
        value: startIndex + i,
    })));
}
