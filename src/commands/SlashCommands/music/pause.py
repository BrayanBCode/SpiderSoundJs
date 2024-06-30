import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore

class pause(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] pause cargado.")

    @app_commands.command(name="pause", description="Reproduce una canción")
    async def pause(self, interaction: discord.Interaction):
        await interaction.response.send_message("Sin implementar.")

async def setup(bot):
    await bot.add_cog(pause(bot))