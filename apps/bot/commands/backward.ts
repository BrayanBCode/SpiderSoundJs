import { SlashCommand } from "@/src/Base/discord/SlashCommand";
import { warnNeedSameVC } from "@/src/strategy/PlayBackStrategy.messages";
import { EmptyEmbed } from "@/utils/tools";
import type { GuildMember } from "discord.js";

export default new SlashCommand()
    .setName("backward")
    .setDescription("Retrocede la canción actual en una cantidad específica de segundos.")

    .setExecute(
        async (client, inter) => {
            const GuildID = inter.guildId;
            if (!GuildID) return;

            const seconds = inter.options.getInteger("seconds") ?? 10;
            const player = client.getPlayerOrDefault(inter, GuildID);

            if (player.voiceChannelId != (inter.member as GuildMember).voice.channelId) return warnNeedSameVC(inter);

            if (!player?.playing || !player.current)
                return inter.reply({
                    embeds: [
                        EmptyEmbed()
                            .setDescription("❌ | No hay ninguna canción reproduciéndose actualmente.")
                            .setColor("Red")
                    ],

                });

            player.seek(player.current.position - (seconds * 1_000));
            return inter.reply({
                embeds: [
                    EmptyEmbed()
                        .setDescription(`✅ | Retrocedido la canción ${seconds} segundos.`)
                        .setColor("Green")
                ]
            });
        }
    )

    .addIntegerOption(option =>
        option
            .setName("seconds")
            .setDescription("Número de segundos para retroceder (predeterminado: 10 segundos).")
            .setMinValue(1)
            .setMaxValue(600)
            .setRequired(false)
    )
