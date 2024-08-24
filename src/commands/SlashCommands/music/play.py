import re
import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore

from base.classes.Bot import CustomBot
from base.classes.Youtube import Youtube
from base.utils.colors import Colours

yt = Youtube()

class play(commands.Cog):
    def __init__(self, bot: CustomBot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] play cargado.")

    @app_commands.command(name="play", description="Reproduce una canción o agrega a la cola.")
    @app_commands.describe(url="URL de la canción a reproducir | agregar a la cola.")
    async def play(self, interaction: discord.Interaction, url: str = None):
        await interaction.response.defer()
        print(f"{Fore.BLUE}[info] Comando play ejecutado en '{interaction.guild.name}' por '{interaction.user.name}'.")
        print(f"{Fore.BLUE}[info] URL: {url}")

        player = self.bot.players.get_player(interaction.guild_id) if self.bot.players.get_player(interaction.guild_id) else self.bot.players.create_player(interaction.guild_id)

        if hasattr(interaction.user.voice, 'channel') and await player.joinVoiceChannel(interaction.user.voice.channel) == 'connected':
            if url is None:
                await player.joinVoiceChannel(interaction.user.voice.channel)
                if player.voiceChannel is not None and not player.voiceChannel.is_playing() and len(player.queue) > 0:
                    await player.play(interaction)
                    await interaction.followup.send(
                        embed=discord.Embed(title="Reproducción reanudada.", description="Agrega mas canciones a la cola proprocionando una URL.", color=Colours.default())
                    )
                    return
                await interaction.followup.send(
                    embed=discord.Embed(title="Me he unido al canal de voz.", description="Necesitas proporcionar una URL para reproducir.", color=Colours.default())
                    )
                return

            result = await yt.Search(url)

            result.UploadDefault(player.queue)
            await result.send(interaction)

            player.stoped = False
            
                
            await player.play(interaction)
        else:
            await interaction.followup.send(
                embed=discord.Embed(description="No estás conectado a un canal de voz.", color=discord.Color.red())
                )
            
    @staticmethod
    def clean_title(title):
        return re.sub(r'^(playlist|mix)\s*', '', title, flags=re.IGNORECASE)
        

async def setup(bot):
    await bot.add_cog(play(bot))