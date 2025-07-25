import { formatMS_HHMMSS } from "@/utils/formatMS_HHMMSS.js";
import { ChatInputCommandInteraction, GuildMember, VoiceChannel } from "discord.js";
import { SearchResult, Track } from "lavalink-client";
import { warnNoChannelAcces } from "./PlayBackStrategy.messages.js";
import logger from "@/bot/logger.js";


// pasar a PlayBackStrategt.modules
export function checkUserVC(inter: ChatInputCommandInteraction<"cached">) {

    const vc = (inter.member as GuildMember).voice.channel as VoiceChannel;

    if (!vc.joinable || !vc.speakable) {
        warnNoChannelAcces(inter)
        return false
    }

    return true
}

export function trackOptionFormat(res: SearchResult) {
    const formatTrack = (track: Track, index: number) => ({
        name: `[${formatMS_HHMMSS(track.info.duration)}] ${track.info.title}`.slice(0, 100),
        value: `autocomplete_${index}`,
    });

    const formatPlaylistOption = (title: string, count: number) => ({
        name: `Playlist [${count} Tracks] - ${title}`.slice(0, 100),
        value: `autocomplete_0`,
    });

    if (res.loadType === 'playlist') {
        const title = res.playlist?.title ?? 'Unknown Playlist';
        const count = res.tracks.length;
        return [formatPlaylistOption(title, count)];
    }

    // logger.debug(`TrackOptionFormat: ${res.tracks.length} tracks found`);
    // logger.debug(`${res.tracks.map((track, index) => `${index} - ${track.info.title}`).join(', ')}`);

    return res.tracks.slice(0, 25).map(formatTrack);
}