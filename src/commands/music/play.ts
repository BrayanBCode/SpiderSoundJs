// This command is a test command to play music using the Lavalink client.

import { ChatInputCommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, GuildMember, InteractionResponse, Message, MessageFlags, SlashCommandBuilder, VoiceChannel } from 'discord.js';
import { Command } from '../../class/Commands.js';

import { formatMS_HHMMSS } from '../../utils/formatMS_HHMMSS.js';
import { config } from '../../config/config.js';
import { SearchPlatform, SearchResult, Track } from 'lavalink-client';
import logger from '../../class/logger.js';
import { createEmptyEmbed, simpleEmbedReply } from '../../utils/tools.js';

const autocompleteMap = new Map();

export default new Command(
    {
        data: {
            command: new SlashCommandBuilder()
                .setName("play")
                .addStringOption(
                    o => o
                        .setName("busqueda")
                        .setDescription("Escribe el nombre de la canción, artista o pega un enlace directo.")
                        .setAutocomplete(true)
                        .setRequired(true))
                .addStringOption(
                    o => o
                        .setName("fuente")
                        .setDescription("Selecciona la fuente desde la que reproducir música. Por defecto: YouTube.")
                        .setRequired(false)
                        .setChoices(
                            { name: "Youtube", value: "ytsearch" },
                            { name: "Youtube Music", value: "ytmsearch" },
                            { name: "Spotify", value: "spsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc

                        )),
            category: "Music"

        },

        execute: async (client, inter) => {
            try {
                const GuildID = inter.guildId;
                if (!GuildID) return;

                const voiceChannelID = (inter.member as GuildMember).voice.channelId;
                if (!voiceChannelID) return simpleEmbedReply({
                    interaction: inter,
                    embed: createEmptyEmbed({ description: "Unete a un canal de voz" }).setColor("Yellow"),
                    ephemeral: true
                });

                const vc = (inter.member as GuildMember).voice.channel as VoiceChannel;

                if (!vc.joinable || !vc.speakable) return simpleEmbedReply({
                    interaction: inter,
                    embed: createEmptyEmbed({ description: "No puedo unirme o hablar en este canal" }),
                    ephemeral: true
                })

                const src = (inter.options as CommandInteractionOptionResolver).getString("fuente") as SearchPlatform | undefined;
                const query = (inter.options as CommandInteractionOptionResolver).getString("busqueda") as string;

                if (query === "nothing_found") return simpleEmbedReply({
                    interaction: inter,
                    embed: createEmptyEmbed({ description: "No se encontraron resultados" }).setColor("Yellow"),
                    ephemeral: true
                })

                if (query === "join_vc") return simpleEmbedReply({
                    interaction: inter,
                    embed: createEmptyEmbed({ description: "Te uniste al canal de voz, pero vuelve a ejecutar el comando, por favor.." }).setColor('Yellow'),
                    ephemeral: true
                })

                if (query.includes("https://")) query.replace("https://", "")

                const userID = inter.user.id;
                const fromAutoComplete = autocompleteMap.has(`${userID}_res`) && query.startsWith("autocomplete_");
                let res: SearchResult | undefined;


                if (fromAutoComplete) {
                    if (autocompleteMap.has(`${userID}_timeout`)) clearTimeout(autocompleteMap.get(`${userID}_timeout`));
                    res = autocompleteMap.get(`${userID}_res`);
                    autocompleteMap.delete(`${userID}_res`);
                    autocompleteMap.delete(`${userID}_timeout`);
                }

                const player = client.getPlayer(GuildID) || await client.lavaManager.createPlayer({
                    guildId: GuildID,
                    voiceChannelId: voiceChannelID,
                    textChannelId: inter.channelId,
                    selfDeaf: true,
                    selfMute: false,
                    volume: client.defaultVolume,
                    node: config.bot.user,
                    vcRegion: (inter.member as GuildMember).voice.channel?.rtcRegion!
                })

                if (!player.connected) await player.connect();

                if (player.voiceChannelId !== voiceChannelID) return simpleEmbedReply({
                    interaction: inter,
                    embed: createEmptyEmbed({ description: "Necesitas estar en el mismo canal que yo" }).setColor("Yellow"),
                    ephemeral: true
                })

                logger.debug(`Res: \n${JSON.stringify(res)}`)
                logger.debug(`Query: ${query} - Source: ${src}`)

                if (!res) {
                    res = await player.search({ query: query.replace("autocomplete_", ""), source: !src ? "ytsearch" : src }, inter.user) as SearchResult;
                }

                let addedSongsMsg;

                if (!res || !res.tracks.length) return simpleEmbedReply({
                    interaction: inter,
                    embed: createEmptyEmbed({ description: "No se encontraron resultados" }).setColor("Red"),
                    ephemeral: true
                })

                if (res.loadType === "playlist") {
                    await player.queue.add(res.tracks);

                    const embed = createEmptyEmbed()
                        .setAuthor({ name: `Agregando ${res.pluginInfo.type || "Playlist"} 🎧` })
                        .setTitle(`${res.playlist ? res.playlist.title : query}`)
                        .setThumbnail(res.tracks[0].info.artworkUrl)
                        .setColor('Green')

                    for (let i = 0; i < Math.min(res.tracks.length, 3); i++) {
                        embed.addFields({ name: `${res.tracks[i].info.title}`, value: `${res.tracks[i].info.author} - Duración: ${formatMS_HHMMSS(res.tracks[i].info.duration)}`, inline: true });
                    }

                    embed.addFields({ name: `Se agregaron:`, value: `${res.tracks.length} canciones más`, inline: false });

                    addedSongsMsg = await simpleEmbedReply({ interaction: inter, embed });

                } else {
                    const track = res.tracks[0]

                    await player.queue.add(track);

                    addedSongsMsg = await simpleEmbedReply({
                        interaction: inter,
                        embed: createEmptyEmbed()
                            .setAuthor({ name: `Agregando ${track.info.title} 🎧` })
                            .setDescription(`Autor: ${track.info.author}`)
                            .setThumbnail(track.info.artworkUrl || "")
                            .setColor('Green')
                            .addFields(
                                { name: "Duración", value: formatMS_HHMMSS(track.info.duration), inline: true },
                                { name: "Fuente", value: track.info.sourceName, inline: true }
                            )
                        ,

                    });

                }

                if (addedSongsMsg) setTimeout(() => addedSongsMsg.delete(), 10000);

                if (!player.playing) await player.play(player.connected ? { volume: client.defaultVolume, paused: false } : undefined);

            } catch (err) {
                if (err instanceof Error) {
                    logger.error("play command", err)
                    logger.error(`Stack Trace: ${err.stack}`);
                } else {
                    logger.error('Ocurrió un error desconocido al registrar los comandos');
                }
            }
        },
        autocomplete: async (client, inter) => {
            const GuildID = inter.guildId;
            if (!GuildID) return;

            const voiceChannelID = (inter.member as GuildMember).voice.channelId;
            if (!voiceChannelID) return inter.respond([{ name: `Unete a un canal de voz`, value: "join_vc" }]);

            const focussedQuery = inter.options.getFocused();

            const player = client.lavaManager.getPlayer(GuildID) || await client.lavaManager.createPlayer({
                guildId: GuildID,
                voiceChannelId: voiceChannelID,
                textChannelId: inter.channelId,
                selfDeaf: true,
                selfMute: false,
                volume: client.defaultVolume,
                instaUpdateFiltersFix: true
            });

            if (!player.connected) await player.connect();

            if (player.voiceChannelId !== voiceChannelID) return inter.respond([{ name: `Necesitas estar en un canal de voz`, value: "join_vc" }]);

            if (!focussedQuery.trim().length) return await inter.respond([{ name: `No se encontraron resultados (escribe una busqueda)`, value: "nothing_found" }]);

            const src = (inter.options as CommandInteractionOptionResolver).getString("fuente") as SearchPlatform | undefined || "ytsearch" as SearchPlatform;

            if (focussedQuery.includes("https://")) focussedQuery.replace("https://", "")

            const res = await player.search({ query: focussedQuery, source: src }, inter.user) as SearchResult;

            if (!res.tracks.length) return await inter.respond([{ name: `No se encontraron resultados`, value: "nothing_found" }]);

            const userID = inter.user.id;
            if (autocompleteMap.has(`${userID}_timeout`)) clearTimeout(autocompleteMap.get(`${userID}_timeout`));

            autocompleteMap.set(`${userID}_res`, res);
            autocompleteMap.set(`${userID}_timeout`, setTimeout(() => {
                autocompleteMap.delete(`${userID}_res`);
                autocompleteMap.delete(`${userID}_timeout`);
            }, 25000));


            const formatTrack = (track: Track) => ({
                name: `[${formatMS_HHMMSS(track.info.duration)}] ${track.info.title}`.substring(0, 100),
                value: `autocomplete_${res.tracks.indexOf(track)}`,
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

            await inter.respond(responseOptions);

        }
    }
);

