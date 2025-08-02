import { WithOutPrefix } from "@/structures/commands/WithOutPrefix.js";

export default new WithOutPrefix()
    .setName("hi")
    .setDescription("Saluda al bot")
    .setCategory("Misc")
    .setAliases(["hello", "hola"])
    .setExecute(
        async (client, ctx) => {
            await ctx.reply({
                content: `Hola ${ctx.message.author.username}! 👋`,
            }, true)
        })