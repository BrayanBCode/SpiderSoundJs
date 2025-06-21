import { PrefixCommand } from "@/structures/commands/PrefixCommand.js";

export default new PrefixCommand()
    .setName("ping")
    .setDescription("Muestra la latencia del bot.")
    .setExecute(async (client, ctx) => {
        const start = Date.now();
        const msg = await ctx.reply("Pong!");
        const latency = Date.now() - start;

        await msg.edit({
            content: `Pong! Latencia: ${latency}ms. API: ${Math.round(client.ws.ping)}ms`
        });
    })