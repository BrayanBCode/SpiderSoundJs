import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore

class forceplay(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] forceplay cargado.")
        
    @app_commands.command(name="forceplay", description="Reproduce una canción")
    @app_commands.describe(url="URL de la canción a reproducir")
    async def forceplay(self, interaction: discord.Interaction, url: str):
        await interaction.response.send_message("Sin implementar.")
        
async def setup(bot):
    await bot.add_cog(forceplay(bot))