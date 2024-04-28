import discord
from utils.logic import structure
from discord.ext import bridge, commands
from utils.interface.SendEmbed import EmbeddedMessages


class Help_Cog(commands.Cog):
    def __init__(self, bot) -> None:
        self.bot = bot
        self.HelpEmbed = EmbeddedMessages().HelpEmbed

    @bridge.bridge_command(name='help', description='Despliega la guia de comandos')
    async def help(self, ctx) -> None:
        await ctx.respond(embed=self.HelpEmbed)


def setup(bot):
    bot.add_cog(Help_Cog(bot))
