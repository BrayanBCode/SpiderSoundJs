import { SlashCommand } from "@/src/Base/discord/SlashCommand";
import { PlaybackStrategy } from "@/src/strategy/PlaybackStrategy.js";
import logger from "@/utils/logger";
import { Player, Track } from "moonlink.js";


class PlayNext extends PlaybackStrategy {
    override async addTracks(player: Player, tracks: Track | Track[]): Promise<void> {
        player.queue.tracks.splice(0, 0, ...(Array.isArray(tracks) ? tracks : [tracks]))
    }

    override async afterAddToQueue(player: Player): Promise<void> {
        // No hace nada despues de agregar a la cola
    }
}

const playNext = new PlayNext()

export default new SlashCommand()
    .setName("playnext")
    .setDescription("Reproduce la siguiente canción en la lista de reproducción.")
    .setExecute(async (client, inter) => {
        try {
            await playNext.execute(client, inter)
        } catch (err) {
            logger.error(`[PlayNext Command] ${err}`)
        }
    })
    .setAutoComplete(async (client, inter) => {
        try {
            await playNext.autocomplete(client, inter)
        } catch (err) {
            logger.error(`[PlayNext Command] ${err}`)
        }
    })
    .addStringOption(
        o => o
            .setName("busqueda")
            .setDescription("Escribe el nombre de la canción, artista o pega un enlace directo.")
            .setAutocomplete(true)
            .setRequired(true))

