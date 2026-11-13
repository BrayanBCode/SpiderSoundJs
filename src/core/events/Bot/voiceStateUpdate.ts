import { TextChannel, VoiceState } from "discord.js";
import { DEvent } from "../../classes/events/DEvent.js";
import { BClient } from "../../client/BClient.js";
import logger from "../../client/logger.js";
import { EmptyEmbed } from "../../../utils/messages.js";


enum VoiceStateChange {
    Moved = "moved",
    Disconnected = "disconnected",
    None = "none"

}

export interface VoiceContext {
    guildId: string;
    oldChannelId?: string | null;
    newChannelId?: string | null;
    oldState: VoiceState;
    newState: VoiceState;
}

// Mapa para almacenar los temporizadores de desconexión por inactividad por servidor
const InactivityManager = new Map<string, NodeJS.Timeout>()

export default class VoiceStateUpdate extends DEvent<"voiceStateUpdate"> {
    constructor() {
        super("voiceStateUpdate");
    }

    /**
     * Evento que se dispara cuando el estado de voz de un usuario cambia (se une, sale o cambia de canal, etc).
     * 
     * @param client Cliente del bot
     * @param oldState Estado de voz anterior.
     * @param newState Estado de voz nuevo.
     */
    execute(client: BClient, oldState: VoiceState, newState: VoiceState): void | Promise<void> {
        const ctx: VoiceContext = {
            guildId: oldState.guild.id ?? newState.guild.id,
            oldChannelId: oldState.channelId,
            newChannelId: newState.channelId,
            oldState,
            newState
        };
        DisconnectProcess(client, ctx);
    }
}

function DisconnectProcess(client: BClient, ctx: VoiceContext) {
    const player = client.getPlayer(ctx.guildId);
    if (!player) return;

    // Eventos de otros usuarios solo importan si entran o salen del canal del bot
    if (!isBot(client, ctx) && !didBotChannelUpdate(client, ctx)) return;

    const guildName = client.getGuild(ctx.guildId)?.name ?? ctx.guildId;
    const status = isBotDisconnectedOrMoved(client, ctx);

    if (!isBot(client, ctx)) {
        const action = ctx.newChannelId === player.voiceChannelId ? "entró al" : "salió del";
        logger.debug(`[VoiceState] ${ctx.newState.member?.user.username ?? "Usuario"} ${action} canal del bot en ${guildName}`);
    }

    if (status != VoiceStateChange.None) {
        if (status === VoiceStateChange.Disconnected) {
            logger.info(`[VoiceState] El bot fue desconectado del canal de voz en ${guildName}, destruyendo player`);
            return player.destroy("disconnected");
        }

        // Moved: moonlink 5 actualiza voiceChannelId, reconecta y conserva la reproducción por su cuenta.
        // Solo se sigue de largo para re-evaluar la inactividad en el canal nuevo.
    }

    const reason = getInactivityReason(client, ctx.guildId);
    if (reason) return startInactivityTimer(client, ctx.guildId, reason, 60_000); // 1 minuto

    clearInactivityTimer(ctx.guildId, "hay oyentes y música en curso");

}

export function startInactivityTimer(client: BClient, guildId: string, reason: string, delayMs: number = 60_000) {
    const guildName = client.getGuild(guildId)?.name ?? guildId;

    // Evitar timers duplicados
    if (InactivityManager.has(guildId)) {
        logger.debug(`[InactivityTimer] Ya hay un timer activo en ${guildName} (${reason})`);
        return;
    }

    const timeout = setTimeout(() => {
        InactivityManager.delete(guildId);
        const player = client.getPlayer(guildId);
        const expiredReason = getInactivityReason(client, guildId);

        if (!player || !expiredReason) {
            logger.debug(`[InactivityTimer] Timer expirado en ${guildName}, pero ya hay actividad: no se desconecta`);
            return;
        }

        logger.info(`[InactivityTimer] El bot se desconecta de ${guildName} por inactividad (${expiredReason})`);
        player.destroy("inactivity");

        (client.getTextChannel(player.textChannelId) as TextChannel)?.send({
            embeds: [
                EmptyEmbed()
                    .setDescription("👌 Me he desconectado del canal de voz por inactividad.")
            ]
        }).catch(err => logger.error("[InactivityTimer] Error enviando mensaje de desconexión por inactividad:", err));
    }, delayMs);

    InactivityManager.set(guildId, timeout);
    logger.debug(`[InactivityTimer] Timer de ${delayMs / 1000}s iniciado en ${guildName} (${reason})`);
}

export function clearInactivityTimer(guildId: string, reason: string) {
    const timeout = InactivityManager.get(guildId);
    if (!timeout) return;

    clearTimeout(timeout);
    InactivityManager.delete(guildId);
    logger.debug(`[InactivityTimer] Timer cancelado en ${guildId} (${reason})`);
}


/**
 * Evalúa si el bot debería desconectarse por inactividad:
 * - está solo en el canal de voz, o
 * - no está reproduciendo y la cola está vacía.
 *
 * @returns el motivo si corresponde iniciar el timer de desconexión, `null` si no.
 */
function getInactivityReason(client: BClient, guildId: string): string | null {
    const player = client.getPlayer(guildId);
    if (!player) return null;

    if (isBotAlone(client, guildId)) return "el bot quedó solo en el canal";
    if (!player.playing && player.queue.size === 0) return "sin reproducción y cola vacía";
    return null;
}


/**
 * Devuelve si el miembro que activó el evento "voiceStateUpdate" es el bot.
 * 
 * @returns `true` si el usuario del evento es el bot, `false` si no.
 */
function isBot(client: BClient, ctx: VoiceContext) {
    return ctx.newState.member?.user.id === client.user!.id;
}

/**
 * Verifica si el bot está solo en su canal de voz.
 * Se recomienda llamar primero a {@link didBotChannelUpdate}.
 * 
 * @example
 * if (didBotChannelUpdate(client, oldState, newState)) {
 *     isBotAlone(client, newState)
 * }
 * 
 * @returns `true` si el bot está completamente solo, `false` si hay otros miembros o no se puede determinar.
 */
function isBotAlone(client: BClient, guildId: string) {
    const player = client.getPlayer(guildId)

    if (!player?.voiceChannelId) {
        logger.error(`[isBotAlone] No se pudo obtener "player" de ${client.getGuild(guildId)?.name}`)
        return false;
    }

    const channel = client.getVoiceChannel(player.voiceChannelId)

    if (!channel) {
        logger.error(`[isBotAlone] No se pudo obtener "Voice Channel" de ${client.getGuild(guildId)?.name}`)
        return false;
    }

    return channel.members.size <= 1;
}

/**
 * Verifica si el cambio de estado de voz afecta al canal donde está el bot.
 * 
 * @returns `true` si el cambio ocurrió en el canal del bot, `false` si no.
 */
function didBotChannelUpdate(client: BClient, ctx: VoiceContext) {
    const player = client.getPlayer(ctx.guildId);
    return ctx.oldChannelId === player?.voiceChannelId || ctx.newChannelId === player?.voiceChannelId;
}

/**
 * Determina si el bot fue desconectado del canal de voz.
 * También muestra un log si el bot fue movido o salió del canal.
 * 
 * @returns `true` si el bot fue desconectado, `false` si no.
 */
function isBotDisconnectedOrMoved(client: BClient, ctx: VoiceContext) {
    const Bot = isBot(client, ctx);

    const leftChannel = ctx.oldChannelId && !ctx.newChannelId;
    const switchedChannel =
        ctx.oldChannelId && ctx.newChannelId && ctx.oldChannelId !== ctx.newChannelId && Bot;

    if (switchedChannel) {
        logger.info(`[SwitchedChannel] Moviéndome de "${ctx.oldState.channel?.name}" a "${ctx.newState.channel?.name}"`);
        return VoiceStateChange.Moved;
    }

    if (Bot && leftChannel) {
        return VoiceStateChange.Disconnected;
    }

    return VoiceStateChange.None;
}


