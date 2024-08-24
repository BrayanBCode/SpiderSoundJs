import discord
from discord.ext import commands
from discord import Color, app_commands
from colorama import Fore

from base.classes.SpiderPlayer.player import Player
from base.classes.Youtube import Youtube


yt = Youtube()

class forceplay(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] forceplay cargado.")
        
    @app_commands.command(name="forceplay", description="Fuerza la reproducción de una canción.")
    @app_commands.describe(url="URL de la canción a reproducir")
    async def forceplay(self, interaction: discord.Interaction, url: str):
        user_voice_state = interaction.user.voice
        bot_voice_channel = interaction.guild.voice_client.channel if interaction.guild.voice_client else None

        if not user_voice_state or user_voice_state.channel != bot_voice_channel:
            await interaction.response.send_message(embed=discord.Embed(title="Debes estar en el mismo canal de voz que el bot.", color=Color.red()), ephemeral=True)
            return

        await interaction.response.defer()

        player: Player = self.bot.players.get_player(interaction.guild_id) if self.bot.players.get_player(interaction.guild_id) else self.bot.players.create_player(interaction.guild_id)

        if await player.joinVoiceChannel(interaction.user.voice.channel) == 'connected':

            result = await yt.Search(url)

            result.UploadFirst(player.queue)
            await result.send(interaction)
            
            player.stoped = False
            
            await player.stop()
            await player.play(interaction)

        else:
            await interaction.followup.send(
                embed=discord.Embed(description="No estás conectado a un canal de voz.", color=discord.Color.red())
                )
        
async def setup(bot):
    await bot.add_cog(forceplay(bot))