import { config } from "@/config/config.js";
import { PrefixCommand } from "@/structures/commands/PrefixCommand.js";
import { EmptyEmbed } from "@/utils/tools.js";

export default new PrefixCommand()
    .setName("help")
    .setDescription("Muestra la ayuda del bot.")
    .setExecute(async (_client, ctx,) => {
        await ctx.reply({
            embeds: [
                EmptyEmbed()
                    .setAuthor({ name: "Guia de comandos" })
                    .setTitle("Comandos populares")
                    .setDescription(`Utiliza el comando \`/\` para ver los comandos disponibles.\n\nMediante \`${config.bot.prefix}\` puedes utilizar los comandos de prefijo.\n\nSi necesitas ayuda, puedes unirte a nuestro [servidor de soporte](https://discord.gg/4Z2a9b6f5G).`)
                    .setFields([
                        {
                            name: "/play",
                            value: "Reproduce música en el canal de voz.",
                            inline: true
                        },
                        {
                            name: "/stop",
                            value: "Detiene la música y limpia la cola.",
                            inline: true
                        },
                        {
                            name: "/skip",
                            value: "Salta a la siguiente canción en la cola.",
                            inline: true
                        },
                        {
                            name: "/queue",
                            value: "Muestra la cola de reproducción actual.",
                            inline: true
                        },
                        {
                            name: "/pause",
                            value: "Pausa la música actual.",
                            inline: true
                        },
                        {
                            name: "/resume",
                            value: "Reanuda la música pausada.",
                            inline: true
                        },
                        {
                            name: "/volume",
                            value: "Ajusta el volumen de la música.",
                            inline: true
                        },
                        {
                            name: "/lyrics",
                            value: "Sin implementar aún, pero planeado.",
                            inline: true
                        },
                        {
                            name: "/help",
                            value: "Muestra esta guía de comandos.",
                            inline: true
                        }

                    ])
                    .setFooter({ text: "Para más información, visita nuestro servidor de soporte. (Este comando sigue en desarrollo)" })
            ]
        })
    })
