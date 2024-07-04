import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore

from base.classes.SpiderPlayer.player import Player

class leave(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] leave cargado.")

    @app_commands.command(name="leave", description="Reproduce una canción")
    async def leave(self, interaction: discord.Interaction):
        player: Player = self.bot.players.get_player(interaction.guild_id)

        if player:
            await player.leaveVoiceChannel()
            await interaction.response.send_message(embed=discord.Embed(title="Me he salido del canal de voz.", color=discord.Color.green()))
            return
        else:
            await interaction.response.send_message(embed=discord.Embed(title="No se ha podido salir del canal de voz.", color=discord.Color.red()))
            return

async def setup(bot):
    await bot.add_cog(leave(bot))