import logger from "@/bot/logger.js";
import { Command } from "@/structures/commands/Commands.js";
import { formatMS_HHMMSS } from "@/utils/formatMS_HHMMSS.js";
import { createEmptyEmbed } from "@/utils/tools.js";
import { SlashCommandBuilder, CommandInteractionOptionResolver } from "discord.js";


export default new Command({
    data: {
        command: new SlashCommandBuilder()
            .setName("remove")
            .setDescription("Quita de la lista una cancion a elección")
            .addStringOption(
                o => o
                    .setName("posicion")
                    .setDescription("Posición en la que se encuentra la cancion a remover")
                    .setRequired(true)
                    .setAutocomplete(true)
            ),

        category: "Music"
    },
    // TODO: Utilizar FocusQuery para obtener el numero de playlist y sugerir posibles canciones a remover por ejemplo obtenemos pos 7 sugeriremos canciones de 5 - 7 a 7 + 5
    execute: async (client, interaction) => {

        const GuildID = interaction.guildId

        if (!GuildID) return

        const player = client.getPlayer(GuildID)

        const pos = (interaction.options as CommandInteractionOptionResolver).getString("posicion") as string;

        if (!player || pos == "no_tracks") return await interaction.reply({
            embeds: [
                createEmptyEmbed()
                    .setDescription("No hay canciones a remover, utiliza /play para agregar canciones.")
            ]
        })

        const tracks = player.queue.tracks

        const posInt = parseInt(pos.replace('autocomplete_', ''), 10)
        logger.debug(`Posicion obtenida: ${pos} - ${posInt}`)
        logger.debug(`Cancion de la posición: ${tracks[posInt].info.title}`)
    },

    autocomplete: async (client, interaction) => {
        if (!interaction.guildId) return

        const player = client.lavaManager.getPlayer(interaction.guildId);

        if (!player || player.queue.tracks.length === 0) {
            return interaction.respond([{ name: 'No hay canciones en la cola', value: 'no_tracks' }]);
        }

        const tracks = player.queue.tracks

        const removeSuggestions = tracks.slice(0, 25).map((track: any, index: number) => (
            {
                name: `${index + 1} - [${formatMS_HHMMSS(track.info.duration)}] ${track.info.title} - ${track.info.author ?? 'Autor desconocido'}`.substring(0, 100),
                value: `autocomplete_${index}`
            }
        ))

        interaction.respond(removeSuggestions)

    }
})