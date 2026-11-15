import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { BotDatabase, SavedTrack } from "./database.js";

const track: SavedTrack = {
    uri: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Never Gonna Give You Up",
    author: "Rick Astley",
    duration: 213000,
    artworkUrl: null,
};

describe("BotDatabase favoritos", () => {
    let db: BotDatabase;
    beforeEach(() => { db = new BotDatabase(":memory:"); });
    afterEach(() => db.close());

    test("el ❤️ agrega y, pulsado otra vez, quita", () => {
        expect(db.toggleFavorite("user-1", track)).toBe("added");
        expect(db.getFavorites("user-1").map(f => f.title)).toEqual(["Never Gonna Give You Up"]);

        expect(db.toggleFavorite("user-1", track)).toBe("removed");
        expect(db.getFavorites("user-1")).toEqual([]);
    });

    test("cada usuario tiene sus propios favoritos", () => {
        db.toggleFavorite("user-1", track);
        expect(db.getFavorites("user-2")).toEqual([]);

        expect(db.toggleFavorite("user-2", track)).toBe("added");
        db.toggleFavorite("user-1", track); // user-1 la quita
        expect(db.getFavorites("user-2")).toHaveLength(1);
    });

    test("addFavorite agrega una sola vez y nunca quita", () => {
        expect(db.addFavorite("user-1", track)).toBe(true);
        expect(db.addFavorite("user-1", track)).toBe(false);
        expect(db.getFavorites("user-1")).toHaveLength(1);
    });

    test("removeFavorite quita solo la del usuario y avisa si no estaba", () => {
        db.toggleFavorite("user-1", track);
        db.toggleFavorite("user-2", track);

        expect(db.removeFavorite("user-1", track.uri)).toBe(true);
        expect(db.removeFavorite("user-1", track.uri)).toBe(false);
        expect(db.getFavorites("user-1")).toEqual([]);
        expect(db.getFavorites("user-2")).toHaveLength(1);
    });

    test("guarda los datos para mostrarla y volver a buscarla", () => {
        db.toggleFavorite("user-1", { ...track, artworkUrl: "https://i.ytimg.com/x.jpg" });
        const [fav] = db.getFavorites("user-1");
        expect(fav).toMatchObject({ uri: track.uri, author: "Rick Astley", duration: 213000, artworkUrl: "https://i.ytimg.com/x.jpg" });
        expect(fav.addedAt).toBeGreaterThan(0);
    });
});
