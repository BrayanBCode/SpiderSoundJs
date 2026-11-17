import { describe, expect, test } from "bun:test";
import { queuePage, queuePageCount, type QueueTrack } from "./queueView.js";

const song = (n: number, extra: Partial<QueueTrack> = {}): QueueTrack =>
    ({ title: `Canción ${n}`, author: "Artista", duration: 60_000, uri: `https://youtu.be/${n}`, ...extra });
const queue = (n: number) => Array.from({ length: n }, (_, i) => song(i + 1));

describe("queueView", () => {
    test("pagina de a 10 y siempre hay al menos una página", () => {
        expect(queuePageCount({ tracks: queue(25), loop: "off" })).toBe(3);
        expect(queuePageCount({ tracks: [], loop: "off" })).toBe(1);
    });

    test("la página muestra lo que suena, numera desde la página y arma el pie", () => {
        const page = queuePage({ current: song(0, { position: 130_000, duration: 355_000 }), tracks: queue(25), loop: "queue" }, 1);
        expect(page.index).toBe(1);
        expect(page.description).toContain("▶ **Sonando:** [Canción 0](https://youtu.be/0) · Artista `02:10 / 05:55`");
        expect(page.description).toContain("`11.` [Canción 11](https://youtu.be/11) · Artista `01:00`");
        expect(page.description).not.toContain("`10.`");
        expect(page.footer).toBe("Página 2/3 · 25 en cola (25:00) · Loop: Cola");
    });

    test("una página fuera de rango se lleva al borde", () => {
        expect(queuePage({ tracks: queue(25), loop: "off" }, 99).index).toBe(2);
        expect(queuePage({ tracks: queue(25), loop: "off" }, -1).index).toBe(0);
    });

    test("cola vacía con algo sonando lo avisa", () => {
        const page = queuePage({ current: song(1), tracks: [], loop: "off" }, 0);
        expect(page.description).toContain("No hay más canciones en la cola");
        expect(page.footer).toBe("Página 1/1 · 0 en cola (00:00) · Loop: OFF");
    });

    test("títulos largos se cortan, sin corchetes y sin enlace si la uri no es http", () => {
        const page = queuePage({ tracks: [song(1, { title: `[Remix] ${"a".repeat(80)}`, uri: "local" })], loop: "off" }, 0);
        const line = page.description.split("\n")[0];
        expect(line).not.toContain("[Remix]");
        expect(line).toContain("…**");
        expect(line).not.toContain("](");
    });

    test("en vivo no tiene duración", () => {
        expect(queuePage({ tracks: [song(1, { isStream: true })], loop: "off" }, 0).description).toContain("`En vivo`");
    });
});
