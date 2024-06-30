import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore

class volume(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] volume cargado.")

    @app_commands.command(name="volume", description="Reproduce una canción")
    @app_commands.describe(vol="URL de la canción a reproducir")
    async def volume(self, interaction: discord.Interaction, vol: int):
        await interaction.response.send_message("Sin implementar.")

async def setup(bot):
    await bot.add_cog(volume(bot))