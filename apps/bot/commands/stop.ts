import { SlashCommand } from "@/src/Base/discord/SlashCommand";
import { warnNeedSameVC } from "@/src/strategy/PlayBackStrategy.messages";
import { deleteAfterTimer, EmptyEmbed, replyEmbed } from "@/utils/tools";
import { GuildMember } from "discord.js";

export default new SlashCommand()
    .setName("stop")
    .setDescription("Detiene la reproducción y limpia la lista de reproducción.")
    .setExecute(
        async (client, inter) => {
            const GuildID = inter.guildId;
            if (!GuildID) return;

            const VCID = (inter.member as GuildMember).voice.channelId;
            const player = client.getPlayerOrDefault(inter, GuildID);

            if (player.voiceChannelId != VCID) return warnNeedSameVC(inter);

            if (!VCID || VCID !== player.voiceChannelId)
                return deleteAfterTimer(
                    await replyEmbed({
                        interaction: inter,
                        embed: EmptyEmbed()
                            .setDescription("❌ | Debes unirte a un canal de voz para usar este comando.")
                            .setColor("Red"),
                        ephemeral: true,
                    }), 15000);

            player.stop();

            return inter.reply({
                embeds: [
                    EmptyEmbed()
                        .setAuthor({ name: "⏹️ | Detener", iconURL: inter.user.displayAvatarURL() })
                        .setDescription("La reproducción se ha detenido y la lista de reproducción se ha limpiado.")
                        .setColor("Green")
                ]
            });
        }
    )