from discord.ext import bridge, commands


class Greetings(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @bridge.bridge_command()
    async def hello(self, ctx):
        await ctx.respond("Hello!")

    @bridge.bridge_command()
    async def bye(self, ctx):
        await ctx.respond("Bye!")


def setup(bot):
    bot.add_cog(Greetings(bot))
