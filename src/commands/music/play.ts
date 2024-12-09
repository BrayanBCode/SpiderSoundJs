import { CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, GuildMember, SlashCommandBuilder, VoiceChannel } from 'discord.js';
import { BotClient } from '../../class/BotClient.js';
import { Command } from '../../class/Commands.js';
import { SearchPlatform, SearchResult, Track } from 'lavalink-client/dist/types/index.js';

import { formatMS_HHMMSS } from '../../utils/formatMS_HHMMSS.js';

const autocompleteMap = new Map();

export default new Command(
    {
        data: new SlashCommandBuilder()
            .setName("play")
            .setDescription("Play Music")
            .addStringOption(o => o.setName("source").setDescription("From which Source you want to play?").setRequired(true).setChoices(
                { name: "Youtube", value: "ytsearch" }, // Requires plugin on lavalink: https://github.com/lavalink-devs/youtube-source
                { name: "Youtube Music", value: "ytmsearch" }, // Requires plugin on lavalink: https://github.com/lavalink-devs/youtube-source
                // { name: "Soundcloud", value: "scsearch" },
                // { name: "Deezer", value: "dzsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc
                { name: "Spotify", value: "spsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc
                // { name: "Apple Music", value: "amsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc
                // { name: "Bandcamp", value: "bcsearch" },
                // { name: "Cornhub", value: "phsearch" },
            ))
            .addStringOption(o => o.setName("query").setDescription("What to play?").setAutocomplete(true).setRequired(true)),

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

            const src = (interaction.options as CommandInteractionOptionResolver).getString("source") as SearchPlatform | undefined;
            const query = (interaction.options as CommandInteractionOptionResolver).getString("query") as string;

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

            const player = client.lavalink!.getPlayer(interaction.guildId) || await client.lavalink!.createPlayer({
                guildId: interaction.guildId,
                voiceChannelId: voiceChannelID,
                textChannelId: interaction.channelId,
                selfMute: false,
                selfDeaf: false,
                volume: client.defaultVolume,  // default volume
                node: "SiFunco",
                vcRegion: (interaction.member as GuildMember)?.voice.channel?.rtcRegion!
            });

            const connected = player.connected;

            if (!connected) await player.connect();

            if (player.voiceChannelId !== voiceChannelID) return interaction.reply(
                {
                    embeds: [new EmbedBuilder({ description: "Necesitas estar en el mismo canal que yo" })],
                    ephemeral: true
                });

            const res = (fromAutoComplete || await player.search({ query: query, source: src }, interaction.user)) as SearchResult;
            if (!res || !res.tracks?.length) return interaction.reply({
                embeds: [new EmbedBuilder({ description: `No se encontraron resultados` })],
                ephemeral: true
            });

            await player.queue.add(res.loadType === "playlist" ? res.tracks : res.tracks[fromAutoComplete ? Number(query.replace("autocomplete_", "")) : 0]);

            const emb = new EmbedBuilder({ title: `Busqueda - ${res.loadType}`, description: `${res.playlist?.title || `Sin titulo`} - Se agregaron ${res.tracks.length} ` })
                .setFooter({ text: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
                .setColor("Green")
            for (let i = 0; i <= 2; i++) {
                emb.addFields({ name: `${res.tracks[i].info.title} - ${res.tracks[i].info.author}`, value: `Duracion: ${formatMS_HHMMSS(res.tracks[i].info.duration)}` })
            }

            await interaction.reply({
                embeds: [emb]
                // content: res.loadType === "playlist"
                //     ? `✅ Added [${res.tracks.length}] Tracks${res.playlist?.title ? ` - from the ${res.pluginInfo.type || "Playlist"} ${res.playlist.uri ? `[\`${res.playlist.title}\`](<${res.playlist.uri}>)` : `\`${res.playlist.title}\``}` : ""} at \`#${player.queue.tracks.length - res.tracks.length}\``
                //     : `✅ Added [\`${res.tracks[0].info.title}\`](<${res.tracks[0].info.uri}>) by \`${res.tracks[0].info.author}\` at \`#${player.queue.tracks.length}\``
            });

            console.log("Play o eso intenta");

            if (!player.playing) await player.play(connected ? { volume: client.defaultVolume, paused: false } : undefined);
        },
        autocomplete: async (client, interaction) => {
            if (!interaction.guildId) return;
            const voiceChannelID = (interaction.member as GuildMember)?.voice?.channelId;
            if (!voiceChannelID) return interaction.respond([{ name: `Unete a un canal de voz`, value: "join_vc" }]);

            const focussedQuery = interaction.options.getFocused();
            const player = client.lavalink!.getPlayer(interaction.guildId) || await client.lavalink!.createPlayer({
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

            const res = await player.search({ query: focussedQuery, source: interaction.options.getString("source") as SearchPlatform }, interaction.user) as SearchResult;

            if (!res.tracks.length) return await interaction.respond([{ name: `No se encontraron resultados`, value: "nothing_found" }]);

            // handle the res
            if (autocompleteMap.has(`${interaction.user.id}_timeout`)) clearTimeout(autocompleteMap.get(`${interaction.user.id}_timeout`));
            autocompleteMap.set(`${interaction.user.id}_res`, res);
            autocompleteMap.set(`${interaction.user.id}_timeout`, setTimeout(() => {
                autocompleteMap.delete(`${interaction.user.id}_res`);
                autocompleteMap.delete(`${interaction.user.id}_timeout`);
            }, 25000));
            await interaction.respond(
                res.loadType === "playlist" ?
                    [{ name: `Playlist [${res.tracks.length} Tracks] - ${res.playlist?.title}`, value: `autocomplete_0` }]
                    : res.tracks.map((t: Track, i: any) => ({ name: `[${formatMS_HHMMSS(t.info.duration)}] ${t.info.title} (by ${t.info.author || "Unknown-Author"})`.substring(0, 100), value: `autocomplete_${i}` })).slice(0, 25)
            );
        }
    }
)
