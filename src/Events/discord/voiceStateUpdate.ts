import { VoiceState } from "discord.js";
import { BotClient } from "../../class/BotClient.js";
import { BaseDiscordEvent } from "../../class/events/BaseDiscordEvent.js";
import logger from "../../class/logger.js";


export default class VoiceStateUpdate extends BaseDiscordEvent<"voiceStateUpdate"> {
    name: "voiceStateUpdate" = "voiceStateUpdate";
    InactivityManager = new Map<string, NodeJS.Timeout>()


    execute(client: BotClient, oldState: VoiceState, newState: VoiceState): void | Promise<void> {
        if (this.didBotChannelUpdate(client, oldState, newState) && this.isBotAlone(client, newState)) {
            this.disconectByInactivity(client, oldState, newState)
        }


    }

    private isClient(client: BotClient, oldState: VoiceState, newState: VoiceState) {
        return newState.member?.user.id === client.user!.id
    }

    /**
     * Verifica si el bot está solo en su canal de voz.
     * 
     * se recomienda llamar {@link didBotChannelUpdate} antes
     * 
     * @example
     * if (this.didBotChannelUpdate(client, oldState, newState)) {
     *      this.isBotAlone(client, newState)
     * }
     * 
     * @param client Cliente del bot.
     * @param newState Estado de voz actualizado.
     * @returns `true` si el bot está solo, `false` si hay más miembros o no se pudo determinar.
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

    private didBotChannelUpdate(client: BotClient, oldState: VoiceState, newState: VoiceState) {
        const player = client.getPlayer(oldState.guild.id ?? newState.guild.id)

        return oldState.channelId === player?.voiceChannelId || newState.channelId === player?.voiceChannelId
    }

    private disconectByInactivity(client: BotClient, oldState: VoiceState, newState: VoiceState) {
        const GuildID = oldState.guild.id ?? newState.guild.id
        const timeout = this.InactivityManager.get(GuildID)


        if (timeout) timeout.close()
        this.InactivityManager.set(GuildID, setTimeout(() => {
            if (this.didBotChannelUpdate(client, oldState, newState) && this.isBotAlone(client, newState)) {
                const player = client.getPlayer(GuildID)

                if (!player) return

                player.destroy("[VoiceStateUpdate] Disconnected by Inactivity", true)
                client.playerMessage.delete(GuildID).catch(() => {
                    logger.warn("[VoiceStateUpdate] Error al eliminar el mensaje")

                })
                client.playerMessage.MessageContainer.delete(GuildID)

                logger.info(`[VoiceStateUpdate] Desconexion por inactividad en "${newState.guild.name}"`)
            }
        }, 15000))

    }

}
