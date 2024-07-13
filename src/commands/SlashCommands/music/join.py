import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore

from base.classes.Bot import CustomBot
from base.classes.SpiderPlayer.player import Player

class join(commands.Cog):
    def __init__(self, bot):
        self.bot: CustomBot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] join cargado.")

    @app_commands.command(name="join", description="Reproduce una canción")
    async def join(self, interaction: discord.Interaction):
        await interaction.response.defer()
        player: Player = self.bot.players.get_player(interaction.guild_id) if self.bot.players.get_player(interaction.guild_id) else self.bot.players.create_player(interaction.guild_id)

        if interaction.user.voice is None:
            await interaction.followup.send(embed=discord.Embed(title="Debes estar en un canal de voz para usar este comando.", color=discord.Color.red()))
            return
        
        await player.joinVoiceChannel(interaction.user.voice.channel)
        await interaction.followup.send(embed=discord.Embed(title="Me he unido al canal de voz.", color=discord.Color.green()))
        return

async def setup(bot):
    await bot.add_cog(join(bot))