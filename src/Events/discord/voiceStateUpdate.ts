import { VoiceState } from "discord.js";
import { BotClient } from "../../class/BotClient.js";
import { BaseDiscordEvent } from "../../class/events/BaseDiscordEvent.js";
import logger from "../../class/logger.js";

export default class VoiceStateUpdate extends BaseDiscordEvent<"voiceStateUpdate"> {
    name: "voiceStateUpdate" = "voiceStateUpdate";

    // Mapa para almacenar los temporizadores de desconexión por inactividad por servidor
    InactivityManager = new Map<string, NodeJS.Timeout>()

    /**
     * Evento que se dispara cuando el estado de voz de un usuario cambia (se une, sale o cambia de canal, etc).
     * 
     * @param client Cliente del bot
     * @param oldState Estado de voz anterior.
     * @param newState Estado de voz nuevo.
     */
    execute(client: BotClient, oldState: VoiceState, newState: VoiceState): void | Promise<void> {
        this.setDisconectTimer(client, oldState, newState)
    }

    /**
     * Controla el temporizador de desconexión por inactividad.
     * Si el bot fue desconectado, limpia los mensajes. Si no, evalúa si debe iniciar el temporizador.
     * 
     * @param client Cliente del bot
     * @param oldState Estado anterior de voz
     * @param newState Estado nuevo de voz
     */
    private setDisconectTimer(client: BotClient, oldState: VoiceState, newState: VoiceState) {
        if (this.isBotDisconnected(client, oldState, newState)) {
            this.deletePlayerMessage(client, oldState, newState)
        }

        if (!this.shouldDisconnectForInactivity(client, oldState, newState)) return

        this.startDisconect(client, oldState, newState)
    }

    /**
     * Evalúa si el bot debería desconectarse por inactividad.
     * Verifica que:
     * - El bot esté solo en el canal de voz.
     * - No haya pistas en cola.
     * - El evento afecte al canal donde está el bot.
     * 
     * @returns `true` si se cumplen las condiciones para desconectarse, `false` si no.
     */
    private shouldDisconnectForInactivity(client: BotClient, oldState: VoiceState, newState: VoiceState) {
        const GuildID = oldState.guild.id ?? newState.guild.id
        const player = client.getPlayer(GuildID)

        if (player && player.queue.tracks.length === 0) return true

        if (!this.didBotChannelUpdate(client, oldState, newState)) return false

        if (!this.isBotAlone(client, newState)) return false

        return true
    }

    /**
     * Inicia un temporizador de 15 segundos para desconectar el bot por inactividad.
     * Si al finalizar el tiempo el bot sigue solo, se desconecta y destruye el reproductor.
     * 
     * @param client Cliente del bot
     * @param oldState Estado anterior de voz
     * @param newState Estado nuevo de voz
     */
    private startDisconect(client: BotClient, oldState: VoiceState, newState: VoiceState) {
        const GuildID = oldState.guild.id ?? newState.guild.id
        const timeout = this.InactivityManager.get(GuildID)

        if (timeout) timeout.close()

        this.InactivityManager.set(GuildID, setTimeout(() => {
            if (this.didBotChannelUpdate(client, oldState, newState) && this.isBotAlone(client, newState)) {
                const player = client.getPlayer(GuildID)

                if (!player) return

                player.disconnect(true)
                player.destroy("[VoiceStateUpdate] Disconnected/Destroy by Inactivity")

                if (this.isBotDisconnected(client, oldState, newState)) {
                    this.deletePlayerMessage(client, oldState, newState)
                }

                logger.info(`[VoiceStateUpdate] Desconexion por inactividad en "${newState.guild.name}"`)
            }
        }, 15000))
    }

    /**
     * Devuelve si el miembro que activó el evento "voiceStateUpdate" es el bot.
     * 
     * @returns `true` si el usuario del evento es el bot, `false` si no.
     */
    private isBot(client: BotClient, newState: VoiceState) {
        return newState.member?.user.id === client.user!.id
    }

    /**
     * Elimina el mensaje de control de reproducción y limpia la data del mensaje en caché.
     * También cancela cualquier temporizador de inactividad pendiente.
     * 
     * @param client Cliente del bot
     * @param oldState Estado anterior de voz
     * @param newState Estado nuevo de voz
     */
    private deletePlayerMessage(client: BotClient, oldState: VoiceState, newState: VoiceState) {
        client.playerMessage.delete(oldState.guild.id ?? newState.guild.id)
            .then(() => {
                logger.info(`Se eliminó el registro "playerMessage" de ${newState.guild.name}`)
                client.playerMessage.deleteData(oldState.guild.id ?? newState.guild.id)
            })
            .catch(() => {
                logger.warn("[startDisconect] Error al eliminar el mensaje")
            })

        this.InactivityManager.get(newState.guild.id)?.close()
    }

    /**
     * Verifica si el bot está solo en su canal de voz.
     * Se recomienda llamar primero a {@link didBotChannelUpdate}.
     * 
     * @example
     * if (this.didBotChannelUpdate(client, oldState, newState)) {
     *     this.isBotAlone(client, newState)
     * }
     * 
     * @returns `true` si el bot está completamente solo, `false` si hay otros miembros o no se puede determinar.
     */
    private isBotAlone(client: BotClient, newState: VoiceState) {
        const player = client.getPlayer(newState.guild.id)

        if (!player?.voiceChannelId) {
            logger.error(`[isBotAlone] No se pudo obtener "player" de ${newState.guild.name}`)
            return false;
        }

        const channel = client.getVoiceChannel(player.voiceChannelId)

        if (!channel) {
            logger.error(`[isBotAlone] No se pudo obtener "Voice Channel" de ${newState.guild.name}`)
            return false;
        }

        return channel.members.size <= 1;
    }

    /**
     * Verifica si el cambio de estado de voz afecta al canal donde está el bot.
     * 
     * @returns `true` si el cambio ocurrió en el canal del bot, `false` si no.
     */
    private didBotChannelUpdate(client: BotClient, oldState: VoiceState, newState: VoiceState) {
        const player = client.getPlayer(oldState.guild.id ?? newState.guild.id)
        return oldState.channelId === player?.voiceChannelId || newState.channelId === player?.voiceChannelId
    }

    /**
     * Determina si el bot fue desconectado del canal de voz.
     * También muestra un log si el bot fue movido o salió del canal.
     * 
     * @returns `true` si el bot fue desconectado, `false` si no.
     */
    private isBotDisconnected(client: BotClient, oldState: VoiceState, newState: VoiceState) {
        const isBot = this.isBot(client, newState);

        const leftChannel = oldState.channelId && !newState.channelId;
        const switchedChannel = oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId;

        if (switchedChannel) {
            logger.info(`[SwitchedChannel] Moviéndome de "${oldState.channel?.name}" a "${newState.channel?.name}"`)
        }

        if (isBot && leftChannel) {
            logger.debug("[isBotDisconnected] El bot fue desconectado del canal de voz");
            return true;
        }

        return false;
    }
}
