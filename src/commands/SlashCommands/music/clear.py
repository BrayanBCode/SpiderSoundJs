import discord
from discord.ext import commands
from discord import Color, app_commands
from colorama import Fore

from base.classes.Bot import CustomBot
from base.classes.SpiderPlayer.player import Player

class clear(commands.Cog):
    def __init__(self, bot):
        self.bot: CustomBot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] clear cargado.")

    @app_commands.command(name="clear", description="Reproduce una canción")
    async def clear(self, interaction: discord.Interaction):
        player: Player = self.bot.players.get_player(interaction.guild_id)

        if player:
            player.clear_queue()
            await interaction.response.send_message(embed=discord.Embed(title="Se ha limpiado la cola.", color=Color(0x24005A)))
            return
        
        await interaction.response.send_message(embed=discord.Embed(title="No hay canciones en la cola.", color=Color.red()))

async def setup(bot):
    await bot.add_cog(clear(bot))