import discord
from discord.ext import commands
from discord import Color, app_commands
from colorama import Fore

from base.classes.Bot import CustomBot
from base.classes.SpiderPlayer.player import Player

class sourceVolume(commands.Cog):
    def __init__(self, bot):
        self.bot: CustomBot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] sourceVolume cargado.")

    @app_commands.command(name="sourcevolume", description="Ajusta el volumen de la fuente de audio (0-100).")
    async def sourceVolume(self, interaction: discord.Interaction, volume: int):

        if volume < 0 or volume > 100:
            await interaction.response.send_message(embed=discord.Embed(title="El volumen debe ser un número entre 0 y 100.", color=discord.Color.red()))
            return
        
        player: Player = self.bot.players.get_player(interaction.guild_id)

        if player:
            player.sourceVolume = volume
            player.GuildTable.setMusicSetting["sourceVolume"] = volume
            player.GuildTable.insert()

            await interaction.response.send_message(embed=discord.Embed(title=f"Se ha ajustado el volumen de la fuente a {volume}.", color=Color.green()))
            return
        else:
            await interaction.response.send_message(embed=discord.Embed(title="No se ha podido ajustar el volumen de la fuente.", color=Color.red()))
            return

async def setup(bot):
    await bot.add_cog(sourceVolume(bot))
