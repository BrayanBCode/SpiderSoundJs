import { Track } from "poru";

export default interface Player {
    play(track: Track): void;
    stop(): void;
    pause(): void;
    resume(): void;
}