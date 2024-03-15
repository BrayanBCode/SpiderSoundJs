import discord
from discord.ext import commands
from discord.commands.context import ApplicationContext
from discord import option, Embed
from testosterona.test import SummonerClass
class GetLvl(commands.Cog):
    
    def __init__(self,bot):
        self.bot = bot
    
    @discord.slash_command(name='lollvl', description='Te da tu nivel en lol')
    @option('invocador', str, description="Nombre de invocador")
    async def lollvl (self, ctx: ApplicationContext, invocador: str) -> None:
        pepe = SummonerClass()
        pepe.getsumm(invocador)
        emb = Embed(title="Sumoner Sheet", description=pepe.setlvl())
        emb.add_field(name=pepe.setname,value="")
        emb.set_image(pepe.seticon())
        await ctx.respond(embed=emb)

    

def setup(bot):
    bot.add_cog(GetLvl(bot))