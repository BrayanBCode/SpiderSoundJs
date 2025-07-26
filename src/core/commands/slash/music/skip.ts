import logger from "@/bot/logger.js";
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { formatMS_HHMMSS } from "@/utils/formatMS_HHMMSS.js";
import { GuildMember, EmbedBuilder, MessageFlags } from "discord.js";


const autocompleteMap = new Map<string, { tracks: any[]; timeout: NodeJS.Timeout }>();

export default new SlashCommand()
    .setName("skip")
    .setDescription("Salta una canción o una específica en la cola.")
    .setCategory("Music")
    .setExecute(
        async (client, interaction) => {
            if (!interaction.guildId) return;

            const skipTo = interaction.options.getString("canción");

            logger.debug(`SkipCommand option **canción** value: ${skipTo}`)

            const player = client.manager?.getPlayer(interaction.guildId);
            const voiceChannelID = (interaction.member as GuildMember).voice.channelId;

            if (!player || (!player.queue.tracks.length && !player.playing)) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription("La cola está vacía, utiliza /play para agregar canciones.")
                            .setColor("Yellow")
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }


            if (voiceChannelID !== player.voiceChannelId) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription("Únete a mi canal de voz para saltar la canción")
                            .setColor("Yellow")
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            if (!skipTo) {
                await player.skip();



                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription("⏭️ Canción saltada")
                            .setColor("Green")
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            const songIndex = parseInt(skipTo.replace('autocomplete_', ''), 10);
            if (isNaN(songIndex) || songIndex < 0 || songIndex > player.queue.tracks.length) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription("Índice de canción no válido.")
                            .setColor("Red")
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            await player.skip(songIndex); // Para avanzar a la canción sele ccionada


            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`⏭️ Saltando a la canción: **${player.queue.tracks[songIndex].info.title}**`)
                        .setColor("Green")
                ],
                flags: MessageFlags.Ephemeral
            });
        })
    .setAutoComplete(async (client, interaction) => {
        if (!interaction.guildId) return;

        const player = client.manager.getPlayer(interaction.guildId);

        if (!player || player.queue.tracks.length === 0) {
            return interaction.respond([{ name: 'No hay canciones en la cola', value: 'no_tracks' }]);
        }

        const tracks = player.queue.tracks;
        // tracks.slice(0, 25).map
        const suggestions = tracks.slice(0, 25).map((track: any, index: number) => ({
            name: `${index + 1} - [${formatMS_HHMMSS(track.info.duration)}] ${track.info.title} - ${track.info.author ?? 'Autor desconocido'}`.substring(0, 100),
            value: `autocomplete_${index + 1}`
        }));

        // Limpiar entradas antiguas antes de establecer nuevas
        if (autocompleteMap.has(interaction.user.id)) {
            const storedData = autocompleteMap.get(interaction.user.id);
            if (storedData) clearTimeout(storedData.timeout);
            autocompleteMap.delete(interaction.user.id);
        }

        // Almacenar los resultados actuales en el mapa de autocompletado
        autocompleteMap.set(interaction.user.id, {
            tracks, timeout: setTimeout(() => {
                autocompleteMap.delete(interaction.user.id);
            }, 25000)
        });

        await interaction.respond(suggestions);
    })
    .addStringOption(o => o.setName("canción")
        .setDescription("Selecciona la canción a la cual saltar")
        .setAutocomplete(true)
    )


    ;
