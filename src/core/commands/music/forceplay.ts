import logger from "@/bot/logger.js";
import { PlaybackStrategy } from "@/modules/strategy/PlaybackStrategy.js";
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { Player, Track } from "lavalink-client";


class PlayNext extends PlaybackStrategy {
    override async addTracks(player: Player, tracks: Track | Track[]): Promise<void> {
        await player.queue.add(tracks, 0)
    }

    override async afterAddToQueue(player: Player): Promise<void> {
        await player.skip()
    }
}

const forcePlay = new PlayNext()

export default new SlashCommand()
    .setName("forceplay")
    .setDescription("Fuerza la reproducción de una canción, desplazando cualquier pista en la cola actual.")
    .setCategory("Music")
    .setExecute(async (client, inter) => {
        try {
            await forcePlay.execute(client, inter)
        } catch (err) {
            logger.error(`[Foceplay Command] ${err}`)
        }
    })
    .setAutoComplete(async (client, inter) => {
        try {
            await forcePlay.autocomplete(client, inter)
        } catch (err) {
            logger.error(`[Foceplay Command] ${err}`)
        }
    })
    .addStringOption(
        o => o
            .setName("busqueda")
            .setDescription("Introduce el nombre o URL de la canción que deseas reproducir.")
            .setAutocomplete(true)
            .setRequired(true))
    .addStringOption(
        o => o
            .setName("fuente")
            .setDescription("Elige la plataforma desde donde buscar la canción. Por defecto: YouTube.")
            .setRequired(false)
            .setChoices(
                { name: "Youtube", value: "ytsearch" }, // Requires plugin on lavalink: https://github.com/lavalink-devs/youtube-source
                { name: "Youtube Music", value: "ytmsearch" }, // Requires plugin on lavalink: https://github.com/lavalink-devs/youtube-source
                { name: "Spotify", value: "spsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc
                // { name: "Soundcloud", value: "scsearch" },
                // { name: "Deezer", value: "dzsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc
                // { name: "Apple Music", value: "amsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc
                // { name: "Bandcamp", value: "bcsearch" },
                // { name: "Cornhub", value: "phsearch" },
            )
    )