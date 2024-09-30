import discord
from colorama import Fore
from discord.ext import commands

from base.utils.Logging.LogMessages import LogExitoso


class Ping(commands.Cog):
    def __init__(self, bot: commands.bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        LogExitoso("[Prefix Command] Ping cargado.").print()

    @commands.command()
    async def ping(self, ctx):
        await ctx.send(f"Pong! {round(self.bot.latency * 1000)}ms")


async def setup(bot):
    await bot.add_cog(Ping(bot), guilds=[discord.Object(id=1256395249417457775)])
