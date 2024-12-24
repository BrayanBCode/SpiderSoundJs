import { Player, Track, TrackStartEvent } from "lavalink-client/dist/types";
import { BotClient } from "../../class/BotClient.js";
import { EmbedBuilder, TextChannel } from "discord.js";
import { formatMS_HHMMSS } from "../../utils/formatMS_HHMMSS.js";
import { BaseLavalinkEvent } from "../../class/events/BaseLavalinkEvent.js";

export default class trackStart extends BaseLavalinkEvent<"trackStart"> {
    name: "trackStart" = "trackStart";
    once: boolean = false;
    execute(client: BotClient, player: Player, track: Track | null, payload: TrackStartEvent): void {

        if (!track) return;

        let msg = client.lavaManager.getGuildMessage(player.guildId);
        const channel = client.channels.cache.get(player.textChannelId!) as TextChannel | undefined;


        const emb = new EmbedBuilder()
            .setAuthor({ name: "Reproduciendo 🎧🎶" })
            .setTitle(`${track.info.title}`)
            .setDescription(`Duración: ${formatMS_HHMMSS(track.info.duration)}`)
            .setImage(`https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`) // Asegúrate de que track.info.thumbnail es una URL válida
            .setFooter({
                text: `${player.queue.tracks ? `Quedan ${player.queue.tracks.length} canciones más en cola.` : ``}`,
            });



        if (!channel) return console.warn("No se encontró el canal de voz para emitir PlayingMessage...");

        if (!msg) {
            channel.send({
                embeds: [emb],
                flags: [4096]

            }).then((message) => client.lavaManager.setGuildMessage(player.guildId, message));
        } else {
            // Eliminar el mensaje existente
            msg.delete().then(() => {
                // Enviar un nuevo mensaje
                channel.send({
                    embeds: [emb],
                    flags: [4096]
                }).then((message) => client.lavaManager.setGuildMessage(player.guildId, message));
            }).catch(console.error);
        }

        console.log(`reproduciendo: ${track?.info.title}`);
    };
}

