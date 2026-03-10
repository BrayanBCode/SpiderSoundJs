import { SlashCommand } from "@/src/Base/discord/SlashCommand";
import { warnNeedSameVC } from "@/src/strategy/PlayBackStrategy.messages";
import { deleteAfterTimer, EmptyEmbed, replyEmbed } from "@/utils/tools";
import type { GuildMember } from "discord.js";

export default new SlashCommand()
    .setName("pause")
    .setDescription("Pausa la canción actual.")
    .setExecute(
        async (client, inter) => {
            const GuildID = inter.guildId;
            if (!GuildID) return;

            const VCID = (inter.member as GuildMember).voice.channelId;
            const player = client.getPlayerOrDefault(inter, GuildID);

            if (player.voiceChannelId != VCID) return warnNeedSameVC(inter);

            player.pause();

            deleteAfterTimer(await replyEmbed({
                interaction: inter,
                embed: EmptyEmbed()
                    .setAuthor({ name: "⏸️ | Pausa", iconURL: inter.user.displayAvatarURL() })
                    .setDescription("La canción actual ha sido pausada.")
                    .setColor("Green")
            }), 5000)
        })