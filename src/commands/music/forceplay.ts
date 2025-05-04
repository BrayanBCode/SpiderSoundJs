import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../class/Commands.js';

import { Player, Track } from 'lavalink-client';
import { PlaybackStrategy } from '../../class/commands/PlaybackStrategy.js';


class PlayNext extends PlaybackStrategy {
    protected async addTracks(player: Player, tracks: Track | Track[]): Promise<void> {
        await player.queue.add(tracks, 0)
    }

    protected async afterAddToQueue(player: Player): Promise<void> {
        await player.skip()
    }
}

const forcePlay = new PlayNext()

export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("forceplay")
            .setDescription("Fuerza la reproducción de una canción, desplazando cualquier pista en la cola actual.")
            .addStringOption(
                o => o
                    .setName("busqueda")
                    .setDescription("Introduce el nombre o URL de la canción que deseas reproducir.")
                    .setAutocomplete(true)
                    .setRequired(true))
            .addStringOption(o =>
                o.setName("fuente")
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
                    )),

        category: 'Music'
    },
    execute: async (client, inter) => {
        forcePlay.execute(client, inter)
    },
    autocomplete: async (client, inter) => {
        forcePlay.autocomplete(client, inter)
    }
}
);