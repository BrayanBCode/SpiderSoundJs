import { ChatInputCommandInteraction, GuildMember, VoiceChannel } from "discord.js";
import { warnNoChannelAcces } from "./PlayBackStrategy.messages.js";


// pasar a PlayBackStrategt.modules
export function checkUserVC(inter: ChatInputCommandInteraction<"cached">) {

    const vc = (inter.member as GuildMember).voice.channel as VoiceChannel;

    if (!vc.joinable || !vc.speakable) {
        warnNoChannelAcces(inter)
        return false
    }

    return true
}
