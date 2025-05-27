import logger from "@/bot/logger.js";
import { PlaybackStrategy } from "@/modules/strategy/PlaybackStrategy.js";
import { SlashCommand } from "@/structures/commands/SlashCommand.js";


class Play extends PlaybackStrategy { }

const play = new Play()

export default new SlashCommand()
    .setName("play")
    .setDescription("Inicia o agrega una cancion ala lista de reproducción.")
    .setCategory("Music")
    .setExecute(
        async (client, inter) => {
            try {
                await play.execute(client, inter)

            } catch (err) {
                logger.error(`[Play Command] ${err}`)
            }
        })
    .setAutoComplete(
        async (client, inter) => {
            try {
                await play.autocomplete(client, inter)
            } catch (err) {
                logger.error(`[Play Command] ${err}`)
            }

        }
    )
    .addStringOption(
        o => o
            .setName("busqueda")
            .setDescription("Escribe el nombre de la canción, artista o pega un enlace directo.")
            .setAutocomplete(true)
            .setRequired(true))
    .addStringOption(
        o => o
            .setName("fuente")
            .setDescription("Selecciona la fuente desde la que reproducir música. Por defecto: YouTube.")
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



