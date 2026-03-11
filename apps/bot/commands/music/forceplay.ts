import { SlashCommand } from "@/src/Base/discord/SlashCommand";
import { PlaybackStrategy } from "@/music/strategy/PlaybackStrategy";
import logger from "@/utils/logger";
import { Player, Track } from "moonlink.js";


class Forceplay extends PlaybackStrategy {
    override async addTracks(player: Player, tracks: Track | Track[]): Promise<void> {
        player.queue.tracks.splice(0, 0, ...(Array.isArray(tracks) ? tracks : [tracks]))
    }

    override async afterAddToQueue(player: Player): Promise<void> {
        await player.skip()
    }
}

const forcePlay = new Forceplay()

export default new SlashCommand()
    .setName("forceplay")
    .setDescription("Reproduce una canción en la lista de reproducción, ignorando la cola.")
    .setExecute(async (client, inter) => {
        try {
            await forcePlay.execute(client, inter)
        } catch (err) {
            logger.error(`[Forceplay Command] ${err}`)
        }
    })
    .setAutoComplete(async (client, inter) => {
        try {
            await forcePlay.autocomplete(client, inter)
        } catch (err) {
            logger.error(`[Forceplay Command] ${err}`)
        }
    })
    .addStringOption(
        o => o
            .setName("busqueda")
            .setDescription("Escribe el nombre de la canción, artista o pega un enlace directo.")
            .setAutocomplete(true)
            .setRequired(true))





