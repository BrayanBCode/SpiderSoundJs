import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../class/Commands.js';

import { PlaybackStrategy } from '../../class/commands/PlaybackStrategy.js';
import logger from '../../class/logger.js';


class Play extends PlaybackStrategy { }

const play = new Play()

export default new Command(
    {
        data: {
            command: new SlashCommandBuilder()
                .setName("play")
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
                        )),
            category: "Music"

        },

        execute: async (client, inter) => {
            try {
                await play.execute(client, inter)

            } catch (err) {
                logger.error(`[Play Command] ${err}`)
            }
        },
        autocomplete: async (client, inter) => {
            try {
                await play.autocomplete(client, inter)
            } catch (err) {
                logger.error(`[Play Command] ${err}`)
            }

        }
    }
);

