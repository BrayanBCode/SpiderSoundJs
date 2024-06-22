import ISong from "../../interfaces/ISpiderPlayer/ISong";
import ISongOptions from "../../interfaces/ISpiderPlayer/ISongOptions";

export default class Song implements ISong {
    title: string;
    artist: string;
    url: string
    videos!: Song[] | null;
    duration: number | string;
    thumbnail: string;

    constructor(options: ISongOptions) {
        this.title = this.clean_title(options.title);
        this.artist = options.artist;
        this.url = options.url;
        this.duration = this.format_duration(options.duration as number);
        this.thumbnail = options.thumbnail;
        this.videos = options.videos || null;
    }

    clean_title(title: string): string {
        return title.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, ' ').trim();
    }

    format_duration(Seconds: number): string {
        const hours = Math.floor(Seconds / 3600);
        const minutes = Math.floor((Seconds % 3600) / 60);
        const seconds = Seconds % 60;

        let formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        if (hours > 0) {
            formattedDuration = `${hours}:${minutes < 10 ? '0' : ''}${formattedDuration}`;
        }

        return formattedDuration;
    }

    toString(): string {
        return `
        ${this.title} - ${this.artist}\n 
        URL: ${this.url} \n
        Duration: ${this.duration} \n
        Thumbnail: ${this.thumbnail} \n
        Videos: ${this.videos} \n
        `;
    }

}