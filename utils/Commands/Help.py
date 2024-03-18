import discord
from discord.ext import commands
from utils.logic import structure
from utils.interface.SendEmbed import EmbeddedMessages

class Help_Cog(commands.Cog):
    def __init__(self, bot) -> None:
        self.bot = bot
        self.HelpEmbed = EmbeddedMessages().HelpEmbed
         
    @discord.slash_command(name='help', description='Despliega la guia de comandos')
    async def help (self, ctx) -> None:
        await ctx.respond(embed=self.HelpEmbed)
    
def setup(bot):
    bot.add_cog(Help_Cog(bot))