import { PlaybackStrategy } from "@/music/strategy/PlaybackStrategy";
import { SlashCommand } from "@/src/Base/discord/SlashCommand";
import logger from "@/utils/logger";


class Play extends PlaybackStrategy { }

const play = new Play()

export default new SlashCommand()
    .setName("play")
    .setDescription("Inicia o agrega una cancion a la lista de reproducción.")
    .setExecute(
        async (client, inter) => {
            try {
                await play.execute(client, inter)

            } catch (err) {
                logger.error("[Play execute]");
                if (err instanceof Error) {
                    logger.error(err.stack);
                } else {
                    logger.error(err);
                }
            }
        })
    .setAutoComplete(
        async (client, inter) => {
            try {
                await play.autocomplete(client, inter)
            } catch (err) {
                logger.error("[Play autocomplete]");
                if (err instanceof Error) {
                    logger.error(err.stack);
                } else {
                    logger.error(err);
                }

            }

        }
    )
    .addStringOption(
        o => o
            .setName("busqueda")
            .setDescription("Escribe el nombre de la canción, artista o pega un enlace directo.")
            .setAutocomplete(true)
            .setRequired(true))
