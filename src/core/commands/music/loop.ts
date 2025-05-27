import logger from "@/bot/logger.js"
import { SlashCommand } from "@/structures/commands/SlashCommand.js"
import { createEmptyEmbed } from "@/utils/tools.js"
import { CommandInteractionOptionResolver, GuildMember } from "discord.js"
import { RepeatMode } from "lavalink-client"


export default new SlashCommand()
    .setName("loop")
    .setDescription("Activa o desactiva el loop.")
    .setCategory("Music")
    .setExecute(async (client, inter) => {
        try {

            const guildId = inter.guildId

            if (!guildId) return

            const loopSettings = (inter.options as CommandInteractionOptionResolver).getString("mode") as RepeatMode

            const player = client.getPlayer(guildId)

            if (!player) return await inter.reply({
                embeds: [createEmptyEmbed()
                    .setAuthor({ name: "❌ Debes utilizar el comando /play primero" })
                ]
            })

            await player.setRepeatMode(loopSettings)

            // player.play({})

            if (loopSettings === "queue") {
                return await inter.reply({
                    embeds: [
                        createEmptyEmbed()
                            .setAuthor({ iconURL: `${(inter.member as GuildMember).displayAvatarURL()}`, name: `Loop Mode: 🔁 ${loopSettings}`, })
                    ]
                })
            }

            if (loopSettings === "track") {
                return await inter.reply({
                    embeds: [
                        createEmptyEmbed()
                            .setAuthor({ iconURL: `${(inter.member as GuildMember).displayAvatarURL()}`, name: `Loop Mode: 🔂 ${loopSettings}`, })
                    ]
                })
            }

            return await inter.reply({
                embeds: [
                    createEmptyEmbed()
                        .setAuthor({ iconURL: `${(inter.member as GuildMember).displayAvatarURL()}`, name: `Loop Mode: ❌ ${loopSettings}`, })
                ]
            })

        } catch (err) {
            if (err instanceof Error) {
                logger.error("loop command", err)
                logger.error(`Stack Trace: ${err.stack}`);
            } else {
                logger.error('Ocurrió un error desconocido al registrar los comandos');
            }
        }

    })
    .addStringOption(
        o => o
            .setName("mode")
            .setDescription("Elije que modo quieres 😎")
            .addChoices(
                { name: "🔂 Cancion actual", value: "track" },
                { name: "🔁 Lista de reproducción", value: "queue" },
                { name: "❌ Desactivar", value: "off" }
            )
            .setRequired(true))


