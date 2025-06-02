import logger from "@/bot/logger.js";
import { CustomButtonBuilder } from "@/modules/buttons/ButtonBuilder.js";
import { DisplayButtonsBuilder } from "@/modules/buttons/DisplayButtonsBuilder.js";
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { formatMS_HHMMSS } from "@/utils/formatMS_HHMMSS.js";
import { createEmptyEmbed, replyEmbed } from "@/utils/tools.js";
import { ButtonStyle, CommandInteractionOptionResolver, TextChannel } from "discord.js";


export default new SlashCommand()
    .setName("remove")
    .setDescription("Quita de la lista una cancion a elección")
    .setCategory("Music")
    .setExecute(
        async (c, i) => {
            if (!i.guildId) return

            const player = c.getPlayer(i.guildId);
            const pos = (i.options as CommandInteractionOptionResolver).getNumber("pos") as number;

            if (!player) {
                return await i.reply({
                    embeds: [
                        createEmptyEmbed()
                            .setDescription("No hay canciones a remover, utiliza /play para agregar canciones.")
                    ]
                });
            }

            if (pos > player.queue.tracks.length - 1 || pos < 0) return replyEmbed({
                interaction: i,
                embed: createEmptyEmbed()
                    .setDescription(`La posición debe estar entre 0 y ${player.queue.tracks.length - 1}.`)
            })

            const track = player.queue.tracks[Number(pos) - 1];

            if (!track) {
                return await i.reply({
                    embeds: [
                        createEmptyEmbed()
                            .setDescription("No se encontró la canción en la posición especificada.")
                    ]
                });
            }

            const view = new DisplayButtonsBuilder(c)
            view.addButtons(
                new CustomButtonBuilder({
                    custom_id: "yes_remove",
                    label: "✅",
                    style: ButtonStyle.Primary
                },
                    async (_client, interaction, col) => {
                        player.queue.remove(track);

                        await interaction.update({
                            embeds: [
                                createEmptyEmbed()
                                    .setDescription(`✅ Canción **${track.info.title}** removida de la lista.`)
                                    .setFooter({ text: `Posición: ${pos} - Duración: ${formatMS_HHMMSS(track.info.duration!)}` })
                            ],
                            components: []
                        });
                        setTimeout(() => {
                            col.stop();
                        }, 5000)
                    },
                ),
                new CustomButtonBuilder({
                    custom_id: "no_remove",
                    label: "❌",
                    style: ButtonStyle.Danger
                },
                    async (_client, interaction, col) => {
                        await interaction.update({
                            embeds: [
                                createEmptyEmbed()
                                    .setDescription("Remoción cancelada.")
                            ],
                            components: []
                        });
                        setTimeout(() => {
                            col.stop();
                        }, 5000)
                    },
                ),
            )

            view.reply(i,
                [
                    createEmptyEmbed()
                        .setDescription(`¿Estás seguro de que quieres remover la canción **${track.info.title}** de la lista?`)
                        .setFooter({ text: `Posición: ${pos} - Duración: ${formatMS_HHMMSS(track.info.duration!)}` })
                ]
            );

        }
    )
    .addNumberOption(
        o => o
            .setName("pos")
            .setDescription("Posición en la que se encuentra la cancion a remover")
            .setRequired(true)
        // .setAutocomplete(true)
    )

// .setExecute(
//     async (client, interaction) => {

//         const GuildID = interaction.guildId

//         if (!GuildID) return

//         const player = client.getPlayer(GuildID)

//         const pos = (interaction.options as CommandInteractionOptionResolver).getString("posicion") as string;

//         if (!player || pos == "no_tracks") return await interaction.reply({
//             embeds: [
//                 createEmptyEmbed()
//                     .setDescription("No hay canciones a remover, utiliza /play para agregar canciones.")
//             ]
//         })

//         const tracks = player.queue.tracks

//         const posInt = parseInt(pos.replace('autocomplete_', ''), 10)
//         logger.debug(`Posicion obtenida: ${pos} - ${posInt}`)
//         logger.debug(`Cancion de la posición: ${tracks[posInt].info.title}`)
//     })
// .setAutoComplete(
//     // TODO: Utilizar FocusQuery para obtener el numero de playlist y sugerir posibles canciones a remover por ejemplo obtenemos pos 7 sugeriremos canciones de 5 - 7 a 7 + 5
//     async (client, interaction) => {
//         if (!interaction.guildId) return

//         const player = client.lavaManager.getPlayer(interaction.guildId);

//         if (!player || player.queue.tracks.length === 0) {
//             return interaction.respond([{ name: 'No hay canciones en la cola', value: 'no_tracks' }]);
//         }

//         const tracks = player.queue.tracks

//         const removeSuggestions = tracks.slice(0, 25).map((track: any, index: number) => (
//             {
//                 name: `${index + 1} - [${formatMS_HHMMSS(track.info.duration)}] ${track.info.title} - ${track.info.author ?? 'Autor desconocido'}`.substring(0, 100),
//                 value: `autocomplete_${index}`
//             }
//         ))

//         interaction.respond(removeSuggestions)

//     })


