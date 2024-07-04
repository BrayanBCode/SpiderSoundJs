import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore

from base.classes.SpiderPlayer.player import Player

class volume(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] volume cargado.")

    @app_commands.command(name="volume", description="Reproduce una canción")
    @app_commands.describe(vol="URL de la canción a reproducir")
    async def volume(self, interaction: discord.Interaction, vol: int):
        player: Player = self.bot.players.get_player(interaction.guild_id)

        if vol < 0 or vol > 100:
            await interaction.response.send_message(embed=discord.Embed(title="El volumen debe ser un número entre 0 y 100.", color=discord.Color.red()))
            return

        if player:
            player.volume = vol
            if player.voiceChannel.is_playing():
                player.voiceChannel.source.volume = vol / 100
            
            await interaction.response.send_message(embed=discord.Embed(title=f"Volumen cambiado a `{vol}`", color=discord.Color.green()))
            return
        
        else:
            await interaction.response.send_message(embed=discord.Embed(title="No se ha podido cambiar el volumen.", color=discord.Color.red()))
            return


async def setup(bot):
    await bot.add_cog(volume(bot))