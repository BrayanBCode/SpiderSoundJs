// This command is a test command to play music using the Lavalink client.

import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../class/Commands.js';

import { PlaybackStrategy } from '../../class/commands/PlaybackStrategy.js';

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
                            { name: "Youtube", value: "ytsearch" },
                            { name: "Youtube Music", value: "ytmsearch" },
                            { name: "Spotify", value: "spsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc

                        )),
            category: "Music"

        },

        execute: async (client, inter) => {
            play.execute(client, inter)
        },
        autocomplete: async (client, inter) => {
            play.autocomplete(client, inter)
        }
    }
);

