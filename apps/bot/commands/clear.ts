import { SlashCommand } from "@/src/Base/discord/SlashCommand";
import { deleteAfterTimer, EmptyEmbed, replyEmbed } from "@/utils/tools";
import { GuildMember } from "discord.js";

export default new SlashCommand()
    .setName("clear")
    .setDescription("Limpia la lista de reproducción.")
    .setExecute(
        async (client, inter) => {
            const GuildID = inter.guildId;
            if (!GuildID) return;
            const VCID = (inter.member as GuildMember).voice.channelId;
            const player = client.getPlayerOrDefault(inter, GuildID);

            if (!VCID || VCID !== player.voiceChannelId)
                return deleteAfterTimer(

                    await replyEmbed({
                        interaction: inter,
                        embed: EmptyEmbed()
                            .setDescription("❌ | Debes unirte a un canal de voz para usar este comando.")
                            .setColor("Red"),
                        ephemeral: true,
                    }), 15000);

            if (!player.queue.size)
                return deleteAfterTimer(
                    await replyEmbed({
                        interaction: inter,
                        embed: EmptyEmbed()
                            .setDescription("❌ | No hay canciones en la lista de reproducción.")
                            .setColor("Red"),
                        ephemeral: true,
                    }), 15000);

            player.queue.clear();

            return inter.reply({
                embeds: [
                    EmptyEmbed()
                        .setAuthor({ name: "🗑️ | Limpiar lista de reproducción", iconURL: inter.user.displayAvatarURL() })
                        .setDescription("La lista de reproducción ha sido limpiada.")
                        .setColor("Green")
                ]
            });
        }
    )                               