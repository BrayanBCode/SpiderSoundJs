import { CommandInteractionOptionResolver, EmbedBuilder, GuildMember, SlashCommandBuilder, VoiceChannel } from 'discord.js';
import { Command } from '../../class/Commands.js';
import { SearchPlatform, SearchResult, Track } from 'lavalink-client/dist/types/index.js';

import { formatMS_HHMMSS } from '../../utils/formatMS_HHMMSS.js';
import { config } from '../../config/config.js';

const autocompleteMap = new Map();

export default new Command(
    {
        data: new SlashCommandBuilder()
            .setName("play")
            .setDescription("Reproduce musica con la fuente que quieras - YouTube, YouTube Music, Spotify")
            .addStringOption(
                o => o
                    .setName("busqueda")
                    .setDescription("Que ponemos che?")
                    .setAutocomplete(true)
                    .setRequired(true))
            .addStringOption(o =>
                o.setName("fuente")
                    .setDescription("Desde que fuente quieres reproducir?").setRequired(false).setChoices(
                        { name: "Youtube", value: "ytsearch" }, // Requires plugin on lavalink: https://github.com/lavalink-devs/youtube-source
                        { name: "Youtube Music", value: "ytmsearch" }, // Requires plugin on lavalink: https://github.com/lavalink-devs/youtube-source
                        { name: "Spotify", value: "spsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc
                        // { name: "Soundcloud", value: "scsearch" },
                        // { name: "Deezer", value: "dzsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc
                        // { name: "Apple Music", value: "amsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc
                        // { name: "Bandcamp", value: "bcsearch" },
                        // { name: "Cornhub", value: "phsearch" },
                    )),

        execute: async (client, interaction) => {
            if (!interaction.guildId) return;

            const voiceChannelID = (interaction.member as GuildMember)?.voice?.channelId;
            if (!voiceChannelID) return interaction.reply({ embeds: [new EmbedBuilder({ description: `Unete a un canal de voz` }).setColor("Yellow")], ephemeral: true });

            const vc = (interaction.member as GuildMember)?.voice?.channel as VoiceChannel;
            if (!vc.joinable || !vc.speakable) return interaction.reply(
                {
                    embeds: [new EmbedBuilder({ description: `No me puedo unir al canal de voz o hablar por aqui.` }).setColor("Red")],
                    ephemeral: true
                }
            );

            const src = (interaction.options as CommandInteractionOptionResolver).getString("fuente") as SearchPlatform | undefined;
            const query = (interaction.options as CommandInteractionOptionResolver).getString("busqueda") as string;

            if (query === "nothing_found") return interaction.reply({
                embeds: [new EmbedBuilder({ description: `No se encontraron resultados` }).setColor("Yellow")],
                ephemeral: true
            });

            if (query === "join_vc") return interaction.reply(
                {
                    embeds: [new EmbedBuilder({ description: `Te uniste al canal de voz, pero vuelve a ejecutar el comando, por favor..` }).setColor("Yellow")],
                    ephemeral: true
                });

            const fromAutoComplete = (Number(query.replace("autocomplete_", "")) >= 0 && autocompleteMap.has(`${interaction.user.id}_res`)) && autocompleteMap.get(`${interaction.user.id}_res`);
            if (autocompleteMap.has(`${interaction.user.id}_res`)) {
                if (autocompleteMap.has(`${interaction.user.id}_timeout`)) clearTimeout(autocompleteMap.get(`${interaction.user.id}_timeout`));
                autocompleteMap.delete(`${interaction.user.id}_res`);
                autocompleteMap.delete(`${interaction.user.id}_timeout`);
            }

            const player = client.lavaManager.getPlayer(interaction.guildId) || await client.lavaManager.createPlayer({
                guildId: interaction.guildId,
                voiceChannelId: voiceChannelID,
                textChannelId: interaction.channelId,
                selfMute: false,
                selfDeaf: true,
                volume: client.defaultVolume,  // default volume
                node: config.bot.user,
                vcRegion: (interaction.member as GuildMember)?.voice.channel?.rtcRegion!
            });



            if (!player.connected) await player.connect();

            if (player.voiceChannelId !== voiceChannelID) return interaction.reply(
                {
                    embeds: [new EmbedBuilder({ description: "Necesitas estar en el mismo canal que yo" })],
                    ephemeral: true
                });

            const res = (fromAutoComplete || await player.search({ query: query, source: src }, interaction.user)) as SearchResult;
            if (!res || !res.tracks?.length) {
                return interaction.reply({
                    embeds: [new EmbedBuilder({ description: `No se encontraron resultados` })
                        .setColor("Red")],
                    ephemeral: true
                });
            }

            if (res.loadType === "playlist") {
                await player.queue.add(res.tracks);

                const emb = new EmbedBuilder()
                    .setAuthor({ name: `Agregando ${res.pluginInfo.type || "Playlist"} 🎧` })
                    .setTitle(`${res.playlist ? res.playlist.title : query}`)
                    .setThumbnail(`https://img.youtube.com/vi/${res.tracks[0].info.identifier}/hqdefault.jpg`)
                    .setColor('Green')

                for (let i = 0; i < Math.min(res.tracks.length, 3); i++) {
                    emb.addFields({ name: `${res.tracks[i].info.title}`, value: `${res.tracks[i].info.author} - Duración: ${formatMS_HHMMSS(res.tracks[i].info.duration)}`, inline: true });
                }

                emb.addFields({ name: `Se agregaron:`, value: `${res.tracks.length} canciones más`, inline: false });

                // send playlist added message...
                await interaction.reply({
                    embeds: [emb]
                });

            } else {
                const pos = fromAutoComplete ? Number(query.replace("autocomplete_", "")) : 0;
                const track = res.tracks[pos];

                await player.queue.add(track);

                // send added track message...
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: "Agregando 🎧" })
                            .setTitle(track.info.title || "Sin Título")
                            .setDescription(`Duración: ${formatMS_HHMMSS(track.info.duration)}`)
                            .setFooter({
                                text: `Pedido por ${interaction.user.displayName} - Hay ${player.queue.tracks.length} canciones en cola.`,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                            .setThumbnail(`https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`)
                            .setColor('Green')
                    ]
                });
            }

            if (!player.playing) await player.play(player.connected ? { volume: client.defaultVolume, paused: false } : undefined);
        },
        autocomplete: async (client, interaction) => {
            if (!interaction.guildId) return;
            const voiceChannelID = (interaction.member as GuildMember)?.voice?.channelId;
            if (!voiceChannelID) return interaction.respond([{ name: `Unete a un canal de voz`, value: "join_vc" }]);

            const focussedQuery = interaction.options.getFocused();
            const player = client.lavaManager.getPlayer(interaction.guildId) || await client.lavaManager.createPlayer({
                guildId: interaction.guildId,
                voiceChannelId: voiceChannelID,
                textChannelId: interaction.channelId, // in what guild + channel(s)
                selfDeaf: true,
                selfMute: false,
                volume: client.defaultVolume,
                instaUpdateFiltersFix: true // configuration(s)
            });

            if (!player.connected) await player.connect();

            if (player.voiceChannelId !== voiceChannelID) return interaction.respond([{ name: `Necesitas estar en un canal de voz`, value: "join_vc" }]);

            if (!focussedQuery.trim().length) return await interaction.respond([{ name: `No se encontraron resultados (enter a query)`, value: "nothing_found" }]);

            const src = (interaction.options as CommandInteractionOptionResolver).getString("fuente") as SearchPlatform | undefined || "ytsearch" as SearchPlatform;

            const res = await player.search({ query: focussedQuery, source: src }, interaction.user) as SearchResult;

            if (!res.tracks.length) return await interaction.respond([{ name: `No se encontraron resultados`, value: "nothing_found" }]);

            // handle the res
            if (autocompleteMap.has(`${interaction.user.id}_timeout`)) clearTimeout(autocompleteMap.get(`${interaction.user.id}_timeout`));

            autocompleteMap.set(`${interaction.user.id}_res`, res);
            autocompleteMap.set(`${interaction.user.id}_timeout`, setTimeout(() => {
                autocompleteMap.delete(`${interaction.user.id}_res`);
                autocompleteMap.delete(`${interaction.user.id}_timeout`);
            }, 25000));

            const formatTrack = (track: Track, index: number) => ({
                name: `[${formatMS_HHMMSS(track.info.duration)}] ${track.info.title} (de ${track.info.author || 'Autor desconocido'})`.substring(0, 100),
                value: `autocomplete_${index}`,
            });

            const playlistOption = (playlistTitle: string, trackCount: number) => ({
                name: `Playlist [${trackCount} Tracks] - ${playlistTitle}`.substring(0, 100),
                value: `autocomplete_0`,
            });

            const responseOptions = (
                res.loadType === 'playlist'
                    ? [playlistOption(res.playlist?.title || 'Unknown Playlist', res.tracks.length)]
                    : res.tracks.slice(0, 25).map(formatTrack)
            );

            await interaction.respond(responseOptions);
        }
    }
)