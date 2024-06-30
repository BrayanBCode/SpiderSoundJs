import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore

from base.classes.Bot import CustomBot
from base.classes.Youtube import Youtube
from base.interfaces.IPlayList import IPlayList
from base.interfaces.ISearchResults import ISearchResults
from base.interfaces.ISong import ISong

yt = Youtube()

class play(commands.Cog):
    def __init__(self, bot: CustomBot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] play cargado.")

    @app_commands.command(name="play", description="Reproduce una canción")
    @app_commands.describe(url="URL de la canción a reproducir | agregar a la cola.")
    async def play(self, interaction: discord.Interaction, url: str):
        await interaction.response.defer()

        player = self.bot.players.get_player(interaction.guild_id) if self.bot.players.get_player(interaction.guild_id) else self.bot.players.create_player(interaction.guild_id)

        if await player.joinVoiceChannel(interaction.user.voice.channel) == 'connected':

            result = await yt.Search(url)

            if result[0] == 'playlist':
                playlist: IPlayList = result[1]
                for song in playlist.entries:
                    player.add_song(song)

                await interaction.followup.send(embed=discord.Embed(
                    title=f"Playlist - **{playlist.title}**", 
                    description=f"Se han añadido {len(playlist.entries)} canciones a la cola.", 
                    color=discord.Color.green()
                    ))
            if result[0] == 'radio':
                playlist: IPlayList = result[1]
                for song in playlist.entries:
                    player.add_song(song)

                await interaction.followup.send(embed=discord.Embed(
                    title=f"Mix - **{playlist.title}**", 
                    description=f"Se han añadido {len(playlist.entries)} canciones a la cola.", 
                    color=discord.Color.green()
                    ))
                
            if result[0] == 'video':
                video: ISong = result[1]
                player.add_song(video)

                await interaction.followup.send(embed=discord.Embed(
                    title=f"Video - **{video.title}**", 
                    description=f"Se ha añadido la canción a la cola.", 
                    color=discord.Color.green()
                    ))

                
            if result[0] == 'spotify':
                await interaction.followup.send(embed=discord.Embed(
                    title="Spotify", 
                    description="No se puede reproducir contenido de Spotify.", 
                    color=discord.Color.red()
                    ))
                
            if result[0] == 'search':

                search: ISearchResults = await yt.get_search(url)

                # Toca cambiar e implementar la funcion de Choices para que el usuario pueda seleccionar la cancion que desea
                # Se elegira la primera cancion de la lista
                player.add_song(search.results[0])

                await interaction.followup.send(embed=discord.Embed(
                    title=f"Busqueda - **{search.search}**", 
                    description=f"Se han añadido {search.results[0].title} a la cola.", 
                    color=discord.Color.green()
                ))
                
            await player.play(interaction)
        else:
            await interaction.followup.send(
                embed=discord.Embed(description="No estás conectado a un canal de voz.", color=discord.Color.red())
                )


async def setup(bot):
    await bot.add_cog(play(bot))