import { SlashCommand } from "@/src/Base/discord/SlashCommand";
import { warnNeedSameVC } from "@/music/strategy/PlayBackStrategy.messages";
import { createEmptyEmbed, deleteAfterTimer, EmptyEmbed, replyEmbed } from "@/utils/tools";
import { GuildMember } from "discord.js";


export default new SlashCommand()
    .setName("remove")
    .setDescription("Elimina posición especificada en la lista de reproducción.")
    .setExecute(
        async (client, inter) => {
            const GuildID = inter.guildId;
            if (!GuildID) return;

            const VCID = (inter.member as GuildMember).voice.channelId;
            const player = client.getPlayerOrDefault(inter, GuildID);

            if (player.voiceChannelId != VCID) return warnNeedSameVC(inter);

            if (!player.queue.size) {
                return deleteAfterTimer(
                    await replyEmbed({
                        interaction: inter,
                        embed: createEmptyEmbed()
                            .setDescription("❌ | No hay canciones en la lista de reproducción.")
                            .setColor("Red"),
                        ephemeral: true,
                    }), 15000);
            }

            let pos = inter.options.getNumber("position", true);

            const track = player.queue.tracks[pos]!;

            player.queue.remove(pos);

            return inter.reply({
                embeds: [
                    EmptyEmbed()
                        .setAuthor({ name: "❌ | canción eliminada", iconURL: inter.user.displayAvatarURL() })
                        .addFields([
                            { name: "title", value: `[${track.title}](${track.uri})`, inline: true },
                            { name: "artist", value: track.author, inline: true },
                        ])
                        .setThumbnail(track.artworkUrl ?? null)
                        .setFooter({ text: `Solicitado por: ${inter.user.tag}` })
                        .setColor("Green")

                ]
            })
        }
    )
    .setAutoComplete(async (client, inter) => {
        const guildId = inter.guildId;
        if (!guildId) return;

        const player = client.getPlayerOrDefault(inter, guildId);
        const queue = player.queue.tracks;

        if (queue.length === 0) {
            return inter.respond([{ name: "Lista de reproducción vacía", value: -1 }]);
        }

        const focused = Number(inter.options.getFocused());
        const pos = Math.min(Math.max(focused, 0), queue.length - 1); // Clamp seguro entre 0 y último índice

        const range = 5;
        const startIndex = Math.max(0, pos - range);
        const visibleTracks = queue.slice(startIndex, pos + range + 1); // Evitamos función extra

        const options = visibleTracks.map(
            (track, i) => {
                const index = startIndex + i;
                return {
                    name: `${index} - ${track.title}`.slice(0, 100),
                    value: index
                };
            });

        return inter.respond(options);
    })
    .addNumberOption(
        o => o
            .setName("position")
            .setDescription("Especifica la posición que deseas eliminar en la lista de reproducción.")
            .setAutocomplete(true)
            .setRequired(true))