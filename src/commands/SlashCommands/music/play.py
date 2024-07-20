import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore

from base.classes.Bot import CustomBot
from base.classes.Youtube import Youtube
from base.interfaces.IPlayList import IPlayList
from base.interfaces.ISearchResults import ISearchResults
from base.interfaces.ISong import ISong
from base.utils.colors import Colours

yt = Youtube()

class play(commands.Cog):
    def __init__(self, bot: CustomBot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] play cargado.")

    @app_commands.command(name="play", description="Reproduce una canción")
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

                if video.title == 'private':
                    await interaction.followup.send(embed=discord.Embed(
                        title="Video privado",
                        description="No se puede reproducir contenido privado.",
                        color=discord.Color.red()
                    ))
                    return
                
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

                video: ISong = search.results[0]
                # Toca cambiar e implementar la funcion de Choices para que el usuario pueda seleccionar la cancion que desea
                # Se elegira la primera cancion de la lista
                if video.title == 'private':
                    await interaction.followup.send(embed=discord.Embed(
                        title="Video privado",
                        description="No se puede reproducir contenido privado.",
                        color=discord.Color.red()
                    ))
                    return

                player.add_song(search.results[0])

                await interaction.followup.send(embed=discord.Embed(
                    title=f"Busqueda - **{search.search}**", 
                    description=f"Se han añadido {search.results[0].title} a la cola.", 
                    color=discord.Color.green()
                ))

            player.stoped = False
            if len(player.queue) > 0:
                print(f"{Fore.BLUE}[Debug] Canción '{player.queue[0].title}' añadida a la cola en '{interaction.guild.name}'.")
            await player.play(interaction)
        else:
            await interaction.followup.send(
                embed=discord.Embed(description="No estás conectado a un canal de voz.", color=discord.Color.red())
                )


async def setup(bot):
    await bot.add_cog(play(bot))