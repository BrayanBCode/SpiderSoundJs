import { LavalinkManager, Player, Track, TrackStartEvent } from "lavalink-client/dist/types";
import { BotClient } from "../../class/BotClient.js";
import { EmbedBuilder, GuildMember, TextChannel, User } from "discord.js";
import { formatMS_HHMMSS } from "../../utils/formatMS_HHMMSS.js";
import { BaseLavalinkManagerEvents } from "../../class/events/BaseLavalinkManagerEvents.js";
import logger from "../../class/logger.js";
import { error } from "node:console";

export default class trackStart extends BaseLavalinkManagerEvents<"trackStart"> {
    name: "trackStart" = "trackStart";
    once: boolean = false;

    execute(client: BotClient, player: Player, track: Track | null, payload: TrackStartEvent): void {

        if (!track) return;

        let msg = client.lavaManager.getGuildMessage(player.guildId);
        const guild = client.guilds.cache.get(player.guildId)
        const channel = client.channels.cache.get(player.textChannelId!) as TextChannel | undefined;

        const emb = new EmbedBuilder()
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
            .setImage(`https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`)
            .setFooter({
                text: `Pedido por ${(track.requester as User).globalName}`,
                iconURL: (track.requester as User).displayAvatarURL()
            })

        // logger.debug(`requester: ${JSON.stringify(track.requester, null, 2)}`);

        if (!channel) {
            logger.warn("No se encontró el canal de voz para emitir PlayingMessage...");
            return
        }

        channel.send({ embeds: [emb], flags: [4096] })
            .then((message) => {
                client.lavaManager.setGuildMessage(player.guildId, message)
                logger.debug(`Mensaje de reprodución creado de **${channel.name}** en **${guild?.name}**`)

            });

        logger.info(`Reproduciendo **${track?.info.title}** en **${channel.guild.name}**`);
    };
}