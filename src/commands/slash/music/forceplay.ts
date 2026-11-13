import { Player, Track } from "moonlink.js";
import { SlashCommand } from "../../../core/classes/SlashCommand.js";
import { PlaybackStrategy } from "../../../core/strategy/PlaybackStrategy.js";
import logger from "../../../core/client/logger.js";
import { skipTrack } from "../../../core/music/player.js";


class Forceplay extends PlaybackStrategy {
    override async addTracks(player: Player, tracks: Track | Track[]): Promise<void> {
        // insert pasa por la API de la cola (eventos y estado) en vez de tocar el array directo
        player.queue.insert(0, tracks)
    }

    override async afterAddToQueue(player: Player): Promise<void> {
        // Si no suena nada, startIfIdle ya reproduce la canción recién insertada
        if (player.playing) await skipTrack(player)
    }
}

const forcePlay = new Forceplay()

export default new SlashCommand()
    .setName("forceplay")
    .setDescription("Reproduce una canción en la lista de reproducción, ignorando la cola.")
    .setCategory("Music")
    .setExecute(async (client, inter) => {
        try {
            await forcePlay.execute(client, inter)
        } catch (err) {
            logger.error(`[/forceplay] Error no controlado en el comando:`, err)
        }
    })
    .setAutoComplete(async (client, inter) => {
        try {
            await forcePlay.autocomplete(client, inter)
        } catch (err) {
            logger.error(`[/forceplay] Error en el autocompletado:`, err)
        }
    })
    .addStringOption(
        o => o
            .setName("busqueda")
            .setDescription("Escribe el nombre de la canción, artista o pega un enlace directo.")
            .setAutocomplete(true)
            .setRequired(true))





