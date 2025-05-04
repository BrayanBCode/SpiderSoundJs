import { ChatInputCommandInteraction, GuildMember, VoiceChannel } from "discord.js";
import { createEmptyEmbed, simpleEmbedReply } from "../../utils/tools.js";

// pasar a PlayBackStrategt.modules
export function checkVC(inter: ChatInputCommandInteraction<"cached">) {

    const vc = (inter.member as GuildMember).voice.channel as VoiceChannel;

    if (!vc.joinable || !vc.speakable) {
        simpleEmbedReply({
            interaction: inter,
            embed: createEmptyEmbed({ description: "No puedo unirme o hablar en este canal" }),
            ephemeral: true
        })
        return false
    }

    return true
}