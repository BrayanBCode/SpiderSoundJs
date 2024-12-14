import { AutocompleteInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { formatMS_HHMMSS } from "../../utils/formatMS_HHMMSS.js";
import { Command } from "../../class/Commands.js";

const autocompleteMap = new Map<string, { tracks: any[]; timeout: NodeJS.Timeout }>();

export default new Command({
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Salta una canción o una específica en la cola.")
        .addStringOption(o => o.setName("canción")
            .setDescription("Selecciona la canción a la cual saltar")
            .setAutocomplete(true)),

    execute: async (client, interaction) => {
        if (!interaction.guildId) return;

        const skipTo = interaction.options.getString("canción");

        const player = client.lavaManager?.getPlayer(interaction.guildId);
        const voiceChannelID = (interaction.member as GuildMember).voice.channelId;

        if (!player || (!player.queue.tracks.length && !player.playing)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("La cola está vacía, utiliza /play para agregar canciones.")
                        .setColor("Yellow")
                ],
                ephemeral: true
            });
        }


        if (voiceChannelID !== player.voiceChannelId) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("Únete a mi canal de voz para saltar la canción")
                        .setColor("Yellow")
                ],
                ephemeral: true
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
                ephemeral: false
            });
        }

        const songIndex = parseInt(skipTo.replace('autocomplete_', ''), 10);
        if (isNaN(songIndex) || songIndex < 0 || songIndex >= player.queue.tracks.length) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("Índice de canción no válido.")
                        .setColor("Red")
                ],
                ephemeral: true
            });
        }

        await player.skip(songIndex); // Para avanzar a la canción seleccionada

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`⏭️ Saltando a la canción: **${player.queue.tracks[songIndex].info.title}**`)
                    .setColor("Green")
            ],
            ephemeral: false
        });
    },

    autocomplete: async (client, interaction: AutocompleteInteraction) => {
        if (!interaction.guildId) return;

        const player = client.lavaManager!.getPlayer(interaction.guildId);

        if (!player || player.queue.tracks.length === 0) {
            return interaction.respond([{ name: 'No hay canciones en la cola', value: 'no_tracks' }]);
        }

        const tracks = player.queue.tracks;
        const suggestions = tracks.slice(0, 25).map((track: any, index: number) => ({
            name: `${index+1} - [${formatMS_HHMMSS(track.info.duration)}] ${track.info.title} - ${track.info.author || 'Autor desconocido'}`.substring(0, 100),
            value: `autocomplete_${index}`
        }));

        // Limpiar entradas antiguas antes de establecer nuevas
        if (autocompleteMap.has(interaction.user.id)) {
            const storedData = autocompleteMap.get(interaction.user.id);
            if (storedData) clearTimeout(storedData.timeout);
            autocompleteMap.delete(interaction.user.id);
        }

        // Almacenar los resultados actuales en el mapa de autocompletado
        autocompleteMap.set(interaction.user.id, { tracks, timeout: setTimeout(() => {
            autocompleteMap.delete(interaction.user.id);
        }, 25000) });

        await interaction.respond(suggestions);
    }
});
