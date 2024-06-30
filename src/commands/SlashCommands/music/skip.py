import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore


class skip(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] skip cargado.")

    @app_commands.command(name="skip", description="Salta una o varias canciones de la cola de reproducción.")
    @app_commands.describe(posicion="Posición de la canción a saltar.")
    async def skip(self, interaction: discord.Interaction, posicion: int):
        await interaction.response.send_message("Sin implementar.")

async def setup(bot):
    await bot.add_cog(skip(bot))