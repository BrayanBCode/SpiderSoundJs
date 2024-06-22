import Song from "../../classes/SpiderPlayer/Song";

export default interface ISongOptions {    
    title: string;
    artist: string
    url: string;
    videos: Song[] | null;
    duration: number | string;
    thumbnail: string;
}