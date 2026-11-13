import logger from "../../../core/client/logger.js"
import { SlashCommand } from "../../../core/classes/SlashCommand.js"
import { PlaybackStrategy } from "../../../core/strategy/PlaybackStrategy.js"



class Play extends PlaybackStrategy { }

const play = new Play()

export default new SlashCommand()
    .setName("play")
    .setDescription("Inicia o agrega una cancion a la lista de reproducción.")
    .setCategory("Music")
    .setExecute(
        async (client, inter) => {
            try {
                await play.execute(client, inter)

            } catch (err) {
                logger.error(`[/play] Error no controlado en el comando:`, err)
            }
        })
    .setAutoComplete(
        async (client, inter) => {
            try {
                await play.autocomplete(client, inter)
            } catch (err) {
                logger.error(`[/play] Error en el autocompletado:`, err)
            }

        }
    )
    .addStringOption(
        o => o
            .setName("busqueda")
            .setDescription("Escribe el nombre de la canción, artista o pega un enlace directo.")
            .setAutocomplete(true)
            .setRequired(true))
