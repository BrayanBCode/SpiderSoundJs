import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { BotDatabase, SavedTrack } from "../../../src/core/db/database.js";

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

describe("BotDatabase playlists", () => {
    let db: BotDatabase;
    beforeEach(() => { db = new BotDatabase(":memory:"); });
    afterEach(() => db.close());

    const other: SavedTrack = { ...track, uri: "https://www.youtube.com/watch?v=otra", title: "Otra" };

    test("crear, buscar sin distinguir mayúsculas y no repetir nombres", () => {
        const rock = db.createPlaylist("user-1", "Rock");
        expect(rock).toMatchObject({ name: "Rock", trackCount: 0 });
        expect(db.createPlaylist("user-1", "rock")).toBeNull();
        expect(db.getPlaylist("user-1", "ROCK")?.id).toBe(rock!.id);
        // otro usuario puede usar el mismo nombre y no ve las ajenas
        expect(db.createPlaylist("user-2", "Rock")).not.toBeNull();
        expect(db.getPlaylists("user-1")).toHaveLength(1);
    });

    test("agregar mantiene el orden, no duplica y cuenta canciones", () => {
        const { id } = db.createPlaylist("user-1", "Mix")!;
        expect(db.addToPlaylist(id, track)).toBe(true);
        expect(db.addToPlaylist(id, other)).toBe(true);
        expect(db.addToPlaylist(id, track)).toBe(false);
        expect(db.getPlaylistTracks(id).map(t => t.title)).toEqual(["Never Gonna Give You Up", "Otra"]);
        expect(db.getPlaylist("user-1", "mix")?.trackCount).toBe(2);
    });

    test("quitar por posición y seguir agregando al final", () => {
        const { id } = db.createPlaylist("user-1", "Mix")!;
        db.addToPlaylist(id, track);
        db.addToPlaylist(id, other);
        const [first] = db.getPlaylistTracks(id);
        expect(db.removeFromPlaylist(id, first.position)).toBe(true);
        db.addToPlaylist(id, track);
        expect(db.getPlaylistTracks(id).map(t => t.title)).toEqual(["Otra", "Never Gonna Give You Up"]);
    });

    test("renombrar y borrar solo las propias; borrar se lleva las canciones", () => {
        const mix = db.createPlaylist("user-1", "Mix")!;
        db.createPlaylist("user-1", "Rock");
        db.addToPlaylist(mix.id, track);

        expect(db.renamePlaylist("user-1", mix.id, "rock")).toBe(false); // nombre ocupado
        expect(db.renamePlaylist("user-1", mix.id, "MIX")).toBe(true);   // cambiar mayúsculas de la misma
        expect(db.renamePlaylist("user-2", mix.id, "Robada")).toBe(false);
        expect(db.deletePlaylist("user-2", mix.id)).toBe(false);

        expect(db.deletePlaylist("user-1", mix.id)).toBe(true);
        expect(db.getPlaylistTracks(mix.id)).toEqual([]);
    });
});
