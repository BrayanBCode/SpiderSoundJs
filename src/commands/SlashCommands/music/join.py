import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore

class join(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] join cargado.")

    @app_commands.command(name="join", description="Reproduce una canción")
    async def join(self, interaction: discord.Interaction):
        await interaction.response.send_message("Sin implementar.")

async def setup(bot):
    await bot.add_cog(join(bot))