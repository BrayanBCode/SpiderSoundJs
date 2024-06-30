import discord
from discord.ext import commands
from discord import app_commands
from colorama import init, Fore, Style

class ready(commands.Cog):
    def __init__(self, bot: commands.bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        
        print(f"{Fore.CYAN}[Sistema] ready cargado.")
        await self.bot.change_presence(status=discord.Status.online, activity=discord.Game("/play <url | cancion>"))
        print(f'{Fore.CYAN}[Sistema] El bot está listo como {self.bot.user}.')

async def setup(bot):
    await bot.add_cog(ready(bot))