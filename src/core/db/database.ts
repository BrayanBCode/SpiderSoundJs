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
    }

    /** Agrega la canción a los favoritos del usuario, o la quita si ya estaba */
    toggleFavorite(userId: string, track: SavedTrack): "added" | "removed" {
        return this.db.transaction(() => {
            const removed = this.db.query("DELETE FROM favorites WHERE user_id = $userId AND uri = $uri")
                .run({ userId, uri: track.uri });
            if (removed.changes > 0) return "removed" as const;

            this.db.query(`
                INSERT INTO favorites (user_id, uri, title, author, duration, artwork_url, added_at)
                VALUES ($userId, $uri, $title, $author, $duration, $artworkUrl, $addedAt)`)
                .run({
                    userId,
                    uri: track.uri,
                    title: track.title,
                    author: track.author,
                    duration: track.duration,
                    artworkUrl: track.artworkUrl ?? null,
                    addedAt: Date.now(),
                });
            return "added" as const;
        })();
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

    close() {
        this.db.close();
    }
}
