import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore

class remove(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] remove cargado.")

    @app_commands.command(name="remove", description="Reproduce una canción")
    @app_commands.describe(posicion="Posición de la canción a remover.")
    async def remove(self, interaction: discord.Interaction, posicion: int):
        await interaction.response.send_message("Sin implementar.")

async def setup(bot):
    await bot.add_cog(remove(bot))