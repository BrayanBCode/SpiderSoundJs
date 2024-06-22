import { VoiceConnection } from "@discordjs/voice";
import Song from "../../classes/SpiderPlayer/Song";

export default interface IGuildPlayer {
    guild_id: string | null;
    queue: any[];
    voiceChannel_id: null | string
    textChannel_id: null | string
    loop: boolean
    deafen: boolean
    on_vc: boolean
    connection: VoiceConnection | null;


    // get_voiceChannel(...args: any): any
    // get_textChannel(...args: any): any
    // get_queue(...args: any): Song[]
    // get_loop(...args: any): boolean
    // get_guild(...args: any): void
    // joinChannel(...args: any): void
    // toggleLoop(...args: any): any
    // appendToQueue(...args: any): void
    // searchSong(...args: any): void
    // leaveVoiceChannel(...args: any): void
    
    // play(...args: any): void
    // skip(...args: any): void
    // pause(...args: any): void
    // resume(...args: any): void
    // stop(...args: any): void
    // clearQueue(...args: any): void
    // shuffleQueue(...args: any): void
    // setVolume(...args: any): void
    




}