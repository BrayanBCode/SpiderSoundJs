import { config } from "@/config/config.js";
import { PrefixCommand } from "@/structures/commands/PrefixCommand.js";
import { createEmptyEmbed } from "@/utils/tools.js";


export default new PrefixCommand()
    .setName("dev")
    .setDescription("Comandos exclusivos para el Developer.")
    .setCategory("Dev")
    .setExecute(
        async (_client, ctx, args) => {
            if (!ctx.message.guildId) return;

            if (![config.dev.id, config.dev.coDevs].includes(ctx.message.author.id)) {
                return await ctx.message.reply({
                    content: "Debes ser el Developer del bot para utilizar esta sección de comandos.",
                });
            }


            await ctx.reply({
                embeds: [
                    createEmptyEmbed()
                        .setTitle("Comandos exclusivos para el Developer.")
                        .setColor("Green")
                        .setDescription(`args: ${args.join(", ") || "Ninguno"}`)
                        .setFooter({ text: `Prefijo actual: ${config.bot.prefix}` })
                ]
            }, true)
        })