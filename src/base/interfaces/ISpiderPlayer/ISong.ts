import Song from "../../classes/SpiderPlayer/Song";

export default interface ISong {
    title: string;
    artist: string
    url: string;
    videos: Song[] | null;
    duration: number | string;
    thumbnail: string;

    clean_title(title: string): string;
    format_duration(Seconds: number): string;
}