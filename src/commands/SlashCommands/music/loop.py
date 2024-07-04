import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore

from base.classes.SpiderPlayer.player import Player
class loop(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] loop cargado.")

    @app_commands.command(name="loop", description="Reproduce una canción")
    async def loop(self, interaction: discord.Interaction):
        player: Player = self.bot.players.get_player(interaction.guild_id)

        if player:
            player.loop = not player.loop
            await interaction.response.send_message(embed=discord.Embed(title=f"Loop {'activado' if player.loop else 'desactivado'}", color=discord.Color.green()))
            return
        else:
            await interaction.response.send_message(embed=discord.Embed(title="No se ha podido activar el loop.", color=discord.Color.red()))
            return

async def setup(bot):
    await bot.add_cog(loop(bot))