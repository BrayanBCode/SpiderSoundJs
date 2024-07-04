import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore

from base.classes.SpiderPlayer.player import Player

class pause(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] pause cargado.")

    @app_commands.command(name="pause", description="Reproduce una canción")
    async def pause(self, interaction: discord.Interaction):
        player: Player = self.bot.players.get_player(interaction.guild_id)

        if player:
            player.pause()
            await interaction.response.send_message(embed=discord.Embed(title="Se ha pausado la canción.", color=discord.Color.green()))
            return
        else:
            await interaction.response.send_message(embed=discord.Embed(title="No se ha podido pausar la canción.", color=discord.Color.red()))
            return

async def setup(bot):
    await bot.add_cog(pause(bot))