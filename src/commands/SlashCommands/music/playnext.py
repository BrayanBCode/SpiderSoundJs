import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore

from base.classes.SpiderPlayer.player import Player
from base.classes.Youtube import Youtube


yt = Youtube()

class playnex(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] playnext cargado.")


    @app_commands.command(name="playnext", description="Reproduce una canción a continuacion de la actual")
    async def playnext(self, interaction: discord.Interaction, url: str):
        await interaction.response.defer()

        player: Player = self.bot.players.get_player(interaction.guild_id) if self.bot.players.get_player(interaction.guild_id) else self.bot.players.create_player(interaction.guild_id)

        if await player.joinVoiceChannel(interaction.user.voice.channel) == 'connected':

            result = await yt.Search(url)

            result.UploadFirst(player.queue)
            await result.send(interaction)
            
            player.stoped = False
            
            await player.play(interaction)

        else:
            await interaction.followup.send(
                embed=discord.Embed(description="No estás conectado a un canal de voz.", color=discord.Color.red())
                )
            
async def setup(bot):
    await bot.add_cog(playnex(bot))