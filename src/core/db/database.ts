import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

/** Lo que se guarda de una canción: lo justo para mostrarla y volver a buscarla por su enlace */
export interface SavedTrack {
    uri: string;
    title: string;
    author: string;
    duration: number;
    artworkUrl?: string | null;
}

export interface FavoriteRow extends SavedTrack {
    addedAt: number;
}

export interface PlaylistSummary {
    id: number;
    name: string;
    trackCount: number;
}

export interface PlaylistTrackRow extends SavedTrack {
    position: number;
}

/** Datos de una canción como parámetros con nombre para las consultas */
const trackParams = (track: SavedTrack) => ({
    uri: track.uri,
    title: track.title,
    author: track.author,
    duration: track.duration,
    artworkUrl: track.artworkUrl ?? null,
});

const PLAYLIST_SUMMARY = `
    SELECT p.id, p.name, (SELECT COUNT(*) FROM playlist_tracks t WHERE t.playlist_id = p.id) AS trackCount
    FROM playlists p`;

/**
 * Base de datos del bot (favoritos y playlists por usuario) en un archivo SQLite.
 * `bun:sqlite` viene con Bun: sin dependencias ni compilación.
 */
export class BotDatabase {
    private db: Database;

    constructor(path = process.env.DB_PATH ?? "data/bot.db") {
        if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
        this.db = new Database(path, { create: true, strict: true });

        // WAL + espera: varios shards (procesos) pueden usar el mismo archivo sin "database is locked"
        this.db.run("PRAGMA journal_mode = WAL");
        this.db.run("PRAGMA busy_timeout = 5000");
        this.db.run("PRAGMA foreign_keys = ON");
        this.migrate();
    }

    private migrate() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS favorites (
                user_id     TEXT    NOT NULL,
                uri         TEXT    NOT NULL,
                title       TEXT    NOT NULL,
                author      TEXT    NOT NULL,
                duration    INTEGER NOT NULL,
                artwork_url TEXT,
                added_at    INTEGER NOT NULL,
                PRIMARY KEY (user_id, uri)
            )`);

        // Las playlists se usan desde la etapa 5 (comandos con menús); la tabla ya queda creada
        this.db.run(`
            CREATE TABLE IF NOT EXISTS playlists (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    TEXT    NOT NULL,
                name       TEXT    NOT NULL,
                created_at INTEGER NOT NULL,
                UNIQUE (user_id, name)
            )`);
        this.db.run(`
            CREATE TABLE IF NOT EXISTS playlist_tracks (
                playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
                position    INTEGER NOT NULL,
                uri         TEXT    NOT NULL,
                title       TEXT    NOT NULL,
                author      TEXT    NOT NULL,
                duration    INTEGER NOT NULL,
                artwork_url TEXT,
                PRIMARY KEY (playlist_id, position)
            )`);

        // Ajustes por servidor: por ahora solo el volumen con el que arranca el reproductor (/volume predeterminado)
        this.db.run(`
            CREATE TABLE IF NOT EXISTS guild_settings (
                guild_id TEXT PRIMARY KEY,
                volume   INTEGER
            )`);
    }

    /** Volumen por defecto del servidor. `null` si nunca se eligió uno */
    getGuildVolume(guildId: string): number | null {
        return this.db.query<{ volume: number | null }, { guildId: string }>("SELECT volume FROM guild_settings WHERE guild_id = $guildId")
            .get({ guildId })?.volume ?? null;
    }

    setGuildVolume(guildId: string, volume: number) {
        this.db.query(`
            INSERT INTO guild_settings (guild_id, volume) VALUES ($guildId, $volume)
            ON CONFLICT (guild_id) DO UPDATE SET volume = excluded.volume`)
            .run({ guildId, volume });
    }

    /** Agrega la canción a los favoritos del usuario, o la quita si ya estaba (botón ❤️) */
    toggleFavorite(userId: string, track: SavedTrack): "added" | "removed" {
        return this.db.transaction(() =>
            this.removeFavorite(userId, track.uri) ? "removed" as const : (this.addFavorite(userId, track), "added" as const)
        )();
    }

    /** Agrega la canción a los favoritos del usuario. `false` si ya estaba (no la duplica ni la quita) */
    addFavorite(userId: string, track: SavedTrack): boolean {
        return this.db.query(`
            INSERT OR IGNORE INTO favorites (user_id, uri, title, author, duration, artwork_url, added_at)
            VALUES ($userId, $uri, $title, $author, $duration, $artworkUrl, $addedAt)`)
            .run({ userId, ...trackParams(track), addedAt: Date.now() }).changes > 0;
    }

    /** Quita una canción de los favoritos del usuario. `false` si no estaba */
    removeFavorite(userId: string, uri: string): boolean {
        return this.db.query("DELETE FROM favorites WHERE user_id = $userId AND uri = $uri").run({ userId, uri }).changes > 0;
    }

    /** Favoritos del usuario, del más nuevo al más viejo */
    getFavorites(userId: string): FavoriteRow[] {
        return this.db.query<FavoriteRow, { userId: string }>(`
            SELECT uri, title, author, duration, artwork_url AS artworkUrl, added_at AS addedAt
            FROM favorites WHERE user_id = $userId ORDER BY added_at DESC`)
            .all({ userId });
    }

    // ---------- Playlists: el nombre es único por usuario sin distinguir mayúsculas ----------

    /** Crea una playlist vacía. `null` si el usuario ya tiene una con ese nombre */
    createPlaylist(userId: string, name: string): PlaylistSummary | null {
        if (this.getPlaylist(userId, name)) return null;
        const { lastInsertRowid } = this.db.query("INSERT INTO playlists (user_id, name, created_at) VALUES ($userId, $name, $createdAt)")
            .run({ userId, name, createdAt: Date.now() });
        return { id: Number(lastInsertRowid), name, trackCount: 0 };
    }

    /** Playlists del usuario ordenadas por nombre, con cuántas canciones tiene cada una */
    getPlaylists(userId: string): PlaylistSummary[] {
        return this.db.query<PlaylistSummary, { userId: string }>(`${PLAYLIST_SUMMARY} WHERE p.user_id = $userId ORDER BY p.name COLLATE NOCASE`)
            .all({ userId });
    }

    /** Playlist del usuario por nombre. Solo encuentra las propias */
    getPlaylist(userId: string, name: string): PlaylistSummary | null {
        return this.db.query<PlaylistSummary, { userId: string; name: string }>(`${PLAYLIST_SUMMARY} WHERE p.user_id = $userId AND p.name = $name COLLATE NOCASE`)
            .get({ userId, name });
    }

    /** `false` si el nombre nuevo ya lo usa otra playlist del usuario */
    renamePlaylist(userId: string, playlistId: number, newName: string): boolean {
        const other = this.getPlaylist(userId, newName);
        if (other && other.id !== playlistId) return false;
        return this.db.query("UPDATE playlists SET name = $newName WHERE id = $playlistId AND user_id = $userId")
            .run({ userId, playlistId, newName }).changes > 0;
    }

    /** Borra la playlist y sus canciones */
    deletePlaylist(userId: string, playlistId: number): boolean {
        return this.db.query("DELETE FROM playlists WHERE id = $playlistId AND user_id = $userId")
            .run({ userId, playlistId }).changes > 0;
    }

    /** Agrega la canción al final. `false` si ya estaba en esa playlist */
    addToPlaylist(playlistId: number, track: SavedTrack): boolean {
        return this.db.transaction(() => {
            const exists = this.db.query("SELECT 1 FROM playlist_tracks WHERE playlist_id = $playlistId AND uri = $uri")
                .get({ playlistId, uri: track.uri });
            if (exists) return false;

            this.db.query(`
                INSERT INTO playlist_tracks (playlist_id, position, uri, title, author, duration, artwork_url)
                VALUES ($playlistId,
                        (SELECT COALESCE(MAX(position), 0) + 1 FROM playlist_tracks WHERE playlist_id = $playlistId),
                        $uri, $title, $author, $duration, $artworkUrl)`)
                .run({ playlistId, ...trackParams(track) });
            return true;
        })();
    }

    /** Canciones de la playlist en el orden en que se agregaron */
    getPlaylistTracks(playlistId: number): PlaylistTrackRow[] {
        return this.db.query<PlaylistTrackRow, { playlistId: number }>(`
            SELECT position, uri, title, author, duration, artwork_url AS artworkUrl
            FROM playlist_tracks WHERE playlist_id = $playlistId ORDER BY position`)
            .all({ playlistId });
    }

    /** Quita una canción por su posición (las demás no se renumeran: solo importa el orden) */
    removeFromPlaylist(playlistId: number, position: number): boolean {
        return this.db.query("DELETE FROM playlist_tracks WHERE playlist_id = $playlistId AND position = $position")
            .run({ playlistId, position }).changes > 0;
    }

    close() {
        this.db.close();
    }
}
