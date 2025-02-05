import { TextChannel, VoiceState } from "discord.js";
import { BotClient } from "../../class/BotClient.js";
import { BaseDiscordEvent } from "../../class/events/BaseDiscordEvent.js";
import { setTimeout } from "node:timers";
import logger from "../../class/logger.js";

export default class VoiceStateUpdate extends BaseDiscordEvent<"voiceStateUpdate"> {
    private inactivityTimeouts: Map<string, NodeJS.Timeout> = new Map();

    name: "voiceStateUpdate" = "voiceStateUpdate";

    execute(client: BotClient, oldState: VoiceState, newState: VoiceState): void | Promise<void> {
        this.disconnectByInactivity(client, oldState, newState);
    }

    async disconnectByInactivity(client: BotClient, oldState: VoiceState, newState: VoiceState) {
        const guild = oldState.guild || newState.guild;

        // logger.info(`[disconnectByInactivity] Comprobando actividad en el servidor: ${guild.name}`);

        // Verificar si el bot fue movido a un nuevo canal
        const botWasMoved = oldState.channelId !== newState.channelId && newState.channel?.members.has(client.user!.id);

        if (botWasMoved) {
            logger.info(`[disconnectByInactivity] El bot fue movido al canal ${newState.channel?.id} en el servidor: ${guild.name}`);

            // Verificar si el canal está vacío al momento del movimiento
            const isNewChannelEmpty = newState.channel!.members.filter((member) => !member.user.bot).size === 0;

            if (isNewChannelEmpty) {
                logger.info(`[disconnectByInactivity] El bot está solo en el nuevo canal. Configurando temporizador de desconexión.`);
                this.startInactivityTimer(client, guild, newState.channel!);
            } else {
                logger.info(`[disconnectByInactivity] Hay usuarios en el nuevo canal, no se configurará el temporizador.`);
            }

            return;
        }

        // Validar que el bot esté en un canal de voz
        const botChannel = oldState.channel || newState.channel;
        if (!botChannel || !botChannel.members.has(client.user!.id)) {
            // logger.debug("[disconnectByInactivity] El bot no está en un canal de voz, Return.");
            return;
        }

        // Verificar si el canal quedó vacío después de que un usuario se movió o desconectó
        const isChannelEmpty =
            botChannel.members.filter((member) => !member.user.bot).size === 0;

        if (isChannelEmpty) {
            logger.info(`[disconnectByInactivity] El canal de voz está vacío en el servidor: ${guild.name}. Configurando temporizador de desconexión.`);
            this.startInactivityTimer(client, guild, botChannel);
        } else {
            // Si el canal no está vacío, eliminar el temporizador existente
            if (this.inactivityTimeouts.has(guild.id)) {
                clearTimeout(this.inactivityTimeouts.get(guild.id)!);
                this.inactivityTimeouts.delete(guild.id);
                logger.info(`[disconnectByInactivity] Detectada actividad en el canal. Temporizador eliminado para el servidor: ${guild.name}`);
            }
        }
    }

    // Método auxiliar para iniciar el temporizador de desconexión
    private startInactivityTimer(client: BotClient, guild: any, channel: any) {
        // Eliminar temporizador previo, si existe
        if (this.inactivityTimeouts.has(guild.id)) {
            clearTimeout(this.inactivityTimeouts.get(guild.id)!);
            this.inactivityTimeouts.delete(guild.id);
            logger.info(`[startInactivityTimer] Temporizador previo eliminado para el servidor: ${guild.name}`);
        }

        // Configurar nuevo temporizador de desconexión
        this.inactivityTimeouts.set(
            guild.id,
            setTimeout(async () => {
                logger.info(`[startInactivityTimer] Ejecutando desconexión por inactividad para el servidor: ${guild.name}`);

                try {
                    const player = client.lavaManager.getPlayer(guild.id);
                    if (!player || !player.playing) {
                        logger.warn(`[startInactivityTimer] No se encontró un reproductor activo para el servidor: ${guild.name}`);
                        return;
                    }

                    let msg = client.lavaManager.getGuildMessage(guild.id);
                    const textChannel = msg
                        ? (msg.channel as TextChannel)
                        : (client.channels.cache.get(player.textChannelId!) as TextChannel | undefined);

                    // Desconectar el reproductor
                    await player.disconnect();
                    logger.info(`[startInactivityTimer] Reproductor desconectado para el servidor: ${guild.name}`);

                    // Eliminar el mensaje de control si existe
                    if (msg) {
                        try {
                            await msg.delete();
                            // client.lavaManager.destroyGuildMessage(player.guildId);
                            logger.info(`[startInactivityTimer] Mensaje de control eliminado para el servidor: ${guild.name}`);
                        } catch (err) {
                            logger.error(`[startInactivityTimer] Error al eliminar el mensaje en el servidor: ${guild.name}:`, err);
                        }
                    }

                    // Notificar al canal de texto
                    if (textChannel) {
                        const embed = client.Tools.createEmbedTemplate()
                            .setAuthor({ name: "Desconexión por inactividad" });
                        await textChannel.send({ embeds: [embed] });
                        logger.info(`[startInactivityTimer] Notificación enviada al canal de texto en el servidor: ${guild.id}`);
                    }
                } catch (error) {
                    logger.error(`[startInactivityTimer] Error durante la desconexión por inactividad en el servidor: ${guild.name}:`, error);
                } finally {
                    // Eliminar el temporizador una vez completado
                    this.inactivityTimeouts.delete(guild.id);
                    logger.info(`[startInactivityTimer] Temporizador limpiado para el servidor: ${guild.name}`);
                }
            }, 15000)
        );
    }



}
