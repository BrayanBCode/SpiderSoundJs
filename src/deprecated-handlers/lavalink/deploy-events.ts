import { EmbedBuilder, GuildMember, TextChannel } from "discord.js";
import { BotClient } from "../../class/BotClient.js";
import { formatMS_HHMMSS } from "../../utils/formatMS_HHMMSS.js";
import { error } from "node:console";

export function deployLavalinkEvents(client: BotClient) {
    console.log("|| Cargando Eventos de Lavalink ||");

    client.on("raw", (d) => client.lavaManager.sendRawData(d))

    client.lavaManager.nodeManager.on("connect", (node) => {
        console.log(`Node ${node.options.id} conectado`);
    });

    client.lavaManager.nodeManager.on("error", (node, error) => {
        console.log(`Node ${node.options.id} tuvo un error: ${error.message}`);
    });
    client.lavaManager.nodeManager.on("destroy", (node, error) => {

    });

    client.lavaManager.on("trackEnd", (player, track) => {
        console.log(`Termino: ${track?.info.title}`);

        if (!player.queue.tracks) {
            return
        }
    })
    client.lavaManager.on("trackStart", (player, track) => {

        if (!track) return;

        let msg = client.lavaManager.getGuildMessage(player.guildId);
        const channel = client.channels.cache.get(player.textChannelId!) as TextChannel | undefined;

        const emb = new EmbedBuilder()
            .setAuthor({ name: "Reproduciendo 🎧🎶" })
            .setTitle(`${track.info.title}`)
            .setDescription(`Duración: ${formatMS_HHMMSS(track.info.duration)}`)
            .setImage(`https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`) // Asegúrate de que track.info.thumbnail es una URL válida
            .setFooter({
                text: `${player.queue.tracks.length ? `Quedan ${player.queue.tracks.length} canciones más en cola.` : ``}`,
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

        console.log(`Reproduciendo ${track?.info.title}`);
    });

    client.lavaManager.on("trackStuck", (player, track) => {
        console.warn(`Se trabo: ${track?.info.title}`);
    })

    client.lavaManager.on("trackError", (player, track, payload) => {
        console.error("trackError: " + payload.error)
    })

    client.lavaManager.on("playerSocketClosed", (data) => {
        console.error('WebSocket cerrado:', data);
    });

    // client.lavaManager.nodeManager.lavaManagerManager.on('playerUpdate', (state) => {
    //     console.log('Actualización del estado del jugador:', state);
    // });

}

