import { describe, expect, test } from "bun:test";
import { discordRelative, loopLabel, remainingMs, startsInMs, totalDuration, youtubeCover } from "./timing.js";

const song = (duration: number, position = 0) => ({ duration, position });
const live = { duration: 0, isStream: true };

describe("timing", () => {
    test("loopLabel traduce los modos de moonlink", () => {
        expect(loopLabel("off")).toBe("OFF");
        expect(loopLabel("track")).toBe("Canción");
        expect(loopLabel("queue")).toBe("Cola");
    });

    test("remainingMs descuenta lo escuchado y no tiene fin en vivo", () => {
        expect(remainingMs(song(300_000, 120_000))).toBe(180_000);
        expect(remainingMs(song(1000, 5000))).toBe(0);
        expect(remainingMs(live)).toBeUndefined();
    });

    test("totalDuration ignora las transmisiones en vivo", () => {
        expect(totalDuration([song(1000), live, song(2000)])).toBe(3000);
    });

    test("startsInMs suma lo que falta de la actual y las anteriores en la cola", () => {
        const queue = [song(60_000), song(30_000), song(10_000)];
        expect(startsInMs(song(100_000, 40_000), queue, 0)).toBe(60_000);
        expect(startsInMs(song(100_000, 40_000), queue, 2)).toBe(150_000);
        expect(startsInMs(null, queue, 1)).toBe(60_000);
        expect(startsInMs(live, queue, 0)).toBeUndefined();
        expect(startsInMs(null, [live, song(1)], 1)).toBeUndefined();
    });

    test("discordRelative arma la marca en segundos", () => {
        expect(discordRelative(90_500, 1_000_000)).toBe("<t:1090:R>");
    });

    test("youtubeCover solo arma la portada chica para YouTube", () => {
        expect(youtubeCover({ sourceName: "youtube", identifier: "dQw4w9WgXcQ" })).toBe("https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg");
        expect(youtubeCover({ sourceName: "spotify", identifier: "abc" })).toBeUndefined();
        expect(youtubeCover({ sourceName: "youtube" })).toBeUndefined();
    });
});
