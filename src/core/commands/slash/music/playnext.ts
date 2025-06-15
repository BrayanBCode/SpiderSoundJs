import logger from "@/bot/logger.js";
import { PlaybackStrategy } from "@/modules/strategy/PlaybackStrategy.js";
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { Player, Track } from "lavalink-client";


class PlayNext extends PlaybackStrategy {
    override async addTracks(player: Player, tracks: Track | Track[]): Promise<void> {
        await player.queue.add(tracks, 0)
    }
}

const playnext = new PlayNext()

export default new SlashCommand()
    .setName("playnext")
    .setDescription("Agrega una canción que se reproducirá después de la actual. Compatible con YouTube, Spotify y más.")
    .setCategory("Music")
    .setExecute(
        async (client, inter) => {
            try {
                await playnext.execute(client, inter)
            } catch (err) {
                logger.error(`[Playnext Command] ${err}`)
            }
        })
    .setAutoComplete(
        async (client, inter) => {
            try {
                await playnext.autocomplete(client, inter)
            } catch (err) {
                logger.error(`[Playnext Command] ${err}`)
            }
        })
    .addStringOption(
        o => o
            .setName("busqueda")
            .setDescription("Que ponemos chee?")
            .setAutocomplete(true)
            .setRequired(true))
    .addStringOption(
        o => o.setName("fuente")
            .setDescription("Desde que fuente quieres reproducir?")
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
            ))
