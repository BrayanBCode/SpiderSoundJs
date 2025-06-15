import logger from "@/bot/logger.js";
import { SlashCommand } from "@/structures/commands/SlashCommand.js";
import { createEmptyEmbed } from "@/utils/tools.js";
import { VoiceChannel } from "discord.js";


export default new SlashCommand()
    .setName("leave")
    .setDescription("Me desconecta del canal de voz")
    .setCategory("Music")
    .setExecute(async (client, interaction) => {
        if (!interaction.guildId) return;

        const guildID = interaction.guildId;
        const player = client.getPlayer(guildID);

        const embErr = createEmptyEmbed()
            .setDescription("No estoy conectado a ningun canal, utiliza /play para agregar canciones.")
            .setColor("Red");

        if (!player?.connected) return interaction.reply({ embeds: [embErr] })

        const channel = client.channels.cache.get(player.voiceChannelId!) as VoiceChannel | undefined;

        await player.disconnect()
        player.destroy("Destoyed by Inactivity", true)
            .then(async () => {
                await interaction.reply({
                    embeds: [
                        createEmptyEmbed()
                            .setDescription(`Me desconecte del canal de voz \`${channel ? channel.name : "Channel not found"}\``)
                            .setColor("Green")
                    ]
                })
            })
            .catch((err: any) => {
                if (err instanceof Error) {
                    logger.error("[leave command]", err)
                    logger.error(`Stack Trace: ${err.stack}`);
                } else {
                    logger.error('Ocurrió un error desconocido al registrar los comandos');
                }
            })

    })
