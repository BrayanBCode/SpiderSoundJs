import discord
from discord.ext import commands
from discord.commands.context import ApplicationContext
from discord import option, Embed
from testosterona import test
class GetLvl(commands.Cog):
    
    def __init__(self,bot):
        self.bot = bot

    @discord.slash_command(name='lollvl', description='Te da tu nivel en lol')
    @option('invocador', str, description="Nombre de invocador")
    async def lollvl (self, ctx: ApplicationContext, summoner: str) -> None:
        
        await ctx.respond(embed=Embed(title="Sumoner Level", description=test.getsumm(summoner)))

def setup(bot):
    bot.add_cog(GetLvl(bot))