import { MessageFlags, PermissionFlagsBits } from "discord.js";
import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import { EmptyEmbed } from "../../../utils/messages.js";
import { requireListener } from "../../../core/music/player.js";
import { DEFAULT_VOLUME } from "../../../core/client/BClient.js";
import logger from "../../../core/client/logger.js";

export default new SlashCommand()
    .setName("volume")
    .setDescription("Cambia el volumen (1-100) o muestra el actual. Con predeterminado, el del servidor.")
    .setCategory("Music")
    .setExecute(
        async (client, inter) => {
            const level = inter.options.getInteger("nivel");
            const asDefault = inter.options.getBoolean("predeterminado") ?? false;
            const saved = client.db.getGuildVolume(inter.guildId);

            // Sin nivel: solo informa (efímero, no molesta al resto)
            if (level === null) {
                const player = client.getPlayer(inter.guildId);
                const lines = [
                    player ? `🔊 Volumen actual: **${player.volume}%**` : null,
                    `Por defecto en este servidor: **${saved ?? DEFAULT_VOLUME}%**${saved === null ? " (el del bot)" : ""}`,
                ].filter(Boolean);
                return inter.reply({ embeds: [EmptyEmbed().setDescription(lines.join("\n")).setColor("Blue")], flags: MessageFlags.Ephemeral });
            }

            if (asDefault) {
                if (!inter.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
                    logger.info(`[/volume] ${inter.user.username} quiso cambiar el volumen por defecto sin permiso en ${inter.guild.name}`);
                    return inter.reply({
                        embeds: [EmptyEmbed().setDescription("❌ | Solo quien puede **Gestionar el servidor** cambia el volumen por defecto.").setColor("Red")],
                        flags: MessageFlags.Ephemeral,
                    });
                }

                client.db.setGuildVolume(inter.guildId, level);
                logger.info(`[/volume] ${inter.user.username} puso el volumen por defecto en ${level}% (antes ${saved ?? `${DEFAULT_VOLUME} del bot`}) en ${inter.guild.name}`);

                // También ahora, si suena algo y quien lo pide está escuchando (misma regla que el resto de los controles)
                const player = client.getPlayer(inter.guildId);
                const applyNow = !!player && inter.member.voice.channelId === player.voiceChannelId;
                if (applyNow) player.setVolume(level);

                return inter.reply({
                    embeds: [EmptyEmbed()
                        .setDescription(`🔊 Volumen por defecto del servidor: **${level}%**${applyNow ? " (también ahora)" : ""}\n-# Se usa cada vez que el bot empieza a reproducir.`)
                        .setColor("Green")],
                });
            }

            const player = await requireListener(client, inter);
            if (!player) return;

            const before = player.volume;
            player.setVolume(level);
            logger.info(`[/volume] ${inter.user.username} cambió el volumen de ${before}% a ${level}% en ${inter.guild.name}`);

            return inter.reply({
                embeds: [EmptyEmbed()
                    .setDescription(`🔊 Volumen: **${level}%**\n-# Vuelve a ${saved ?? DEFAULT_VOLUME}% cuando el bot se desconecta. Para cambiar ese, usá \`predeterminado\`.`)
                    .setColor("Green")],
            });
        }
    )
    .addIntegerOption(o => o
        .setName("nivel")
        .setDescription("Volumen de 1 a 100. Sin elegir, muestra el actual.")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(false))
    .addBooleanOption(o => o
        .setName("predeterminado")
        .setDescription("Guardarlo como volumen por defecto del servidor (requiere Gestionar el servidor).")
        .setRequired(false))
