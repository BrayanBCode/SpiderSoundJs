import discord
from discord.ext import commands

from youtube_dl import YoutubeDL

class Music_Ext(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    

    @commands.command(name="play", aliases=["p", "P"], help="Reproduce la cancion")
    async def play(self, ctx):
        await ctx.send("algo")





