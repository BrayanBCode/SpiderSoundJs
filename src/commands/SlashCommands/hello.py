import discord
from discord.ext import commands
from discord import Color, app_commands
from colorama import Fore


class wave(commands.Cog):
    def __init__(self, bot: commands.bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] wave cargado.")

    @app_commands.command(name="saludo", description="Saluda al bot")
    async def wave(self, interaction: discord.Interaction):
        await interaction.response.send_message(embed=discord.Embed(title=f"Hola! `{interaction.user.display_name}`", description="¿En qué puedo ayudarte?", color=Color(0x24005A)))


async def setup(bot):
    await bot.add_cog(wave(bot))