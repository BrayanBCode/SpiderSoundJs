import discord
from discord.ext import commands

class Music(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        
    @discord.slash_command()
    async def Musica(self, ctx):
        await ctx.respond('Musica!')