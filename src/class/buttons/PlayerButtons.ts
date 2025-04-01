import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, MessageFlags, User } from "discord.js";
import logger from "../logger.js";
import { IPlayerButtons } from "../../interface/IPlayerButtons.js";
import { Player, Track } from "lavalink-client/dist/types/index.js";
import { formatMS_HHMMSS } from "../../utils/formatMS_HHMMSS.js";
import { createEmptyEmbed } from "../../utils/tools.js";
import { QueuePaginator } from "./QueuePaginator.js";

export default async ({ time = undefined, player, TextChannel, client }: IPlayerButtons) => {
    try {
        if (!TextChannel) throw new Error("[PlayerButtons]: Invalid parameters");

        await TextChannel.sendTyping();

        // Declarar botones
        const showQueue = new ButtonBuilder()
            .setCustomId("showQueue")
            .setEmoji("🔢")
            .setStyle(ButtonStyle.Secondary);

        const prevSong = new ButtonBuilder()
            .setCustomId("prevSong")
            .setEmoji("⏪")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(player.queue.previous.length === 0);

        const stop = new ButtonBuilder()
            .setCustomId("stop")
            .setEmoji("⏹️")
            .setStyle(ButtonStyle.Danger);

        const playPause = new ButtonBuilder()
            .setCustomId("playPause")
            .setEmoji("⏯️")
            .setStyle(ButtonStyle.Primary);

        const nextSong = new ButtonBuilder()
            .setCustomId("nextSong")
            .setEmoji("⏩")
            .setStyle(ButtonStyle.Primary);

        const Queue = player.queue;
        const currentTrack = player.queue.current;

        const emb = getPlayingEmbed(currentTrack!, player);

        // Cargarlos en una fila
        const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(showQueue, prevSong, stop, playPause, nextSong);

        const msg = await TextChannel.send({ embeds: [emb], components: [buttons], flags: MessageFlags.SuppressNotifications });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time
        });

        collector.on("collect", async (i) => {
            try {
                await i.deferUpdate();

                if (i.customId === "showQueue") {
                    try {
                        if (!Queue.tracks) {
                            return i.followUp({
                                embeds: [
                                    createEmptyEmbed()
                                        .setDescription("La lista de reproducción está vacía, utiliza /play para agregar canciones.")
                                ],
                                // flags: MessageFlags.Ephemeral
                            });
                        }

                        await client.lavaManager.playingMessageController.SendMessage({ player, client });

                        const queue = player.queue.tracks;

                        const paginator = new QueuePaginator({
                            interaction: i,
                            items: queue,
                        });

                        return paginator.followUp();
                    } catch (error) {
                        logger.error("[PlayerButtons][showQueue]", error);
                    }
                }

                if (i.customId === "prevSong") {
                    try {
                        if (player.queue.previous.length !== 0) {
                            const prevSong = player.queue.previous[0];
                            await player.play({ track: prevSong });

                            const msg = i.followUp({ embeds: [createEmptyEmbed().setDescription(`Reproduciendo: **${prevSong.info.title}**`)] });

                            setTimeout(() => {
                                msg.then(m => m.delete()).catch(err => logger.error("[PlayerButtons][prevSong][Timeout]", err));
                            }, 5000);

                            return;
                        }
                        return;
                    } catch (error) {
                        logger.error("[PlayerButtons][prevSong]", error);
                    }
                }

                if (i.customId === "stop") {
                    try {
                        await player.stopPlaying(true);

                        const msg = i.followUp({ embeds: [createEmptyEmbed().setDescription(`🛑 Se detuvo la reproducción`)] });

                        setTimeout(() => {
                            msg.then(m => m.delete()).catch(err => logger.error("[PlayerButtons][stop][Timeout]", err));
                        }, 5000);
                        return;
                    } catch (error) {
                        logger.error("[PlayerButtons][stop]", error);
                    }
                }

                if (i.customId === "playPause") {
                    try {
                        player.playing ? await player.pause() : await player.resume();

                        const msg = i.followUp({ embeds: [createEmptyEmbed().setDescription(`Reproducción ${player.playing ? "⏸️" : "▶️"}`)] });

                        setTimeout(() => {
                            msg.then(m => m.delete()).catch(err => logger.error("[PlayerButtons][playPause][Timeout]", err));
                        }, 5000);
                        return;
                    } catch (error) {
                        logger.error("[PlayerButtons][playPause]", error);
                    }
                }

                if (i.customId === "nextSong") {
                    try {
                        await player.skip();

                        await client.lavaManager.playingMessageController.SendMessage({ player, client });
                        const msg = i.followUp({ embeds: [createEmptyEmbed().setDescription(`⏭️ Canción saltada`)] });

                        setTimeout(() => {
                            msg.then(m => m.delete()).catch(err => logger.error("[PlayerButtons][nextSong][Timeout]", err));
                            collector.stop();
                        }, 5000);
                    } catch (error) {
                        logger.error("[PlayerButtons][nextSong]", error);
                    }
                }

            } catch (error) {
                logger.error("[PlayerButtons][collect]", error);
            }
        });

        collector.on("end", async () => {


        });

        return msg;

    } catch (error) {
        logger.error("[PlayerButtons]", error);
    }
};

function getPlayingEmbed(track: Track, player: Player) {
    return new EmbedBuilder()
        .setAuthor({ name: "Escuchando 🎧" })
        .setTitle(`${track.info.title}`)
        .setDescription(`[Enlace Oficial](${track.info.uri})`)
        .addFields(
            { name: "Artista", value: `\`${track.info.author}\``, inline: true },
            { name: "Duración", value: `\`${formatMS_HHMMSS(track.info.duration)}\``, inline: true },
            { name: "Volumen", value: `\`${player.volume}\``, inline: true },
            { name: "Loop", value: `\`${player.repeatMode}\``, inline: true },
            { name: "En cola", value: `\`${player.queue.tracks.length}\``, inline: true },
            {
                name: "Duración total",
                value: `\`${formatMS_HHMMSS(player.queue.tracks.reduce((acum, track) => acum + track.info.duration!, 0))}\``,
                inline: true
            },
        )
        .setColor("Blue")
        // .setImage(`https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`)
        .setImage(`${track.info.artworkUrl}`)
        .setFooter({
            text: `Pedido por ${(track.requester as User).globalName}`,
            iconURL: (track.requester as User).displayAvatarURL()
        });
}

