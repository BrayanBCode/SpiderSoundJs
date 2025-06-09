import { BotClient } from "@/bot/BotClient.js";
import logger from "@/bot/logger.js";
import { BaseLavalinkManagerEvents } from "@/structures/events/BaseLavalinkManagerEvents.js";
import { createEmptyEmbed } from "@/utils/tools.js";
import { TextChannel } from "discord.js";
import { Player, Track, UnresolvedTrack, TrackExceptionEvent } from "lavalink-client";


type LavalinkErrorType =
    | "COPYRIGHT"
    | "UNAVAILABLE"
    | "GEO_BLOCKED"
    | "DELETED"
    | "NETWORK_ERROR"
    | "NOT_FOUND"
    | "UNKNOWN";

export default class trackError extends BaseLavalinkManagerEvents<"trackError"> {
    name: "trackError" = "trackError";
    async execute(client: BotClient, player: Player, track: Track | UnresolvedTrack | null, payload: TrackExceptionEvent) {

        const ErrorType = classifyLavalinkErrors(payload.exception?.message)

        if (ErrorType === "COPYRIGHT" && track) {
            // const res = await player.search({ query: `${track.info.title} lyrics`, source: "ytsearch" }, client.user)
            // const filteredTracks = res.tracks.filter((t) => t.info.identifier !== track.info.identifier && t.info.author !== track.info.author);
            // const newTrack = filteredTracks.length > 0 ? filteredTracks[0] : undefined;
            // const oldtrack = player.queue.current
            const textChannel = client.channels.cache.get(player.textChannelId!) as TextChannel | undefined;

            // if (!newTrack) {
            //     return logger.warn("[trackError] No hay más pistas disponibles.");
            // }

            if (!textChannel) return logger.error(`[trackError] No se encontro un canal de texto`)


            // Se agrega la nueva busqueda y reposiciona la cancion actual
            // player.queue.add(newTrack, 0)
            // if (oldtrack) player.queue.add(oldtrack, 1)

            // await player.skip()

            const msg = await textChannel.send({
                embeds: [
                    createEmptyEmbed()
                        .setTitle("Copyright detectado")
                        .setDescription(`No podemos reproducir este contenido ${track.info.title}`) // \n Agregamos otra version de tu busqueda`
                        .setColor("Yellow"),
                    // createEmptyEmbed()
                    //     .setAuthor({ name: `Agregando ${newTrack.info.title} 🎧` })
                    //     .setDescription(`Autor: ${newTrack.info.author}`)
                    //     .setThumbnail(newTrack.info.artworkUrl || "")
                    //     .setColor('Green')
                    //     .addFields(
                    //         { name: "Duración", value: formatMS_HHMMSS(newTrack.info.duration!), inline: true },
                    //         { name: "Fuente", value: newTrack.info.sourceName!, inline: true }
                    //     )
                ]
            })

            setTimeout(() => msg.delete().catch(() => { }), 15000)

            // await player.skip()
            // if (!player.playing) await player.play(player.connected ? { volume: client.defaultVolume, paused: false } : undefined);

        }

    }

}

function classifyLavalinkErrors(exceptionMessage: string = ""): LavalinkErrorType {
    const message = exceptionMessage.toLowerCase();

    if (message.includes("contains content from") || message.includes("blocked") || message.includes("copyright")) {
        return "COPYRIGHT";
    }
    if (message.includes("video unavailable") || message.includes("not available")) {
        return "UNAVAILABLE";
    }
    if (message.includes("not available in your country")) {
        return "GEO_BLOCKED";
    }
    if (message.includes("has been removed")) {
        return "DELETED";
    }
    if (message.includes("failed to load") || message.includes("network error")) {
        return "NETWORK_ERROR";
    }
    if (message.includes("no results found")) {
        return "NOT_FOUND";
    }

    return "UNKNOWN";
}