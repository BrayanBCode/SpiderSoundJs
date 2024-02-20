# Imports basicos
import discord, os
from discord.ext import commands

# Imports utiles para los Cogs
from utils.logic import Structures
from discord import option

# Imports para YT
from youtubesearchpython import VideosSearch
from pytube import Playlist, YouTube

# Imports para API Spotify
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

# Imports para reproduccion de audio
from discord import FFmpegPCMAudio

# Imports de Interaz
from discord import Embed



# SOLUCION TEMPORAL - DEBE IMPLEMENTARSE LA BD
serverQueue = {}

class Music_Cog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
    
    @discord.slash_command(name = "play", description = "Agrega y reproduce musica desde YT")
    async def play(self, ctx, url: str):
        channel = ctx.author.voice.channel
        voice_client =  ctx.guild.voice_client
        Guild = ctx.guild
        
        """Verifica si el autor de comando esta conectado a un canal de voz"""
        if not voice_client:
            if channel:
                await channel.connect()
            else:
                ctx.send(embed=Embed(description='❌ Debe estar conectado a un canal de voz'))
                return
        
        addToQueue(url)
        
        await ctx.respond("Sin implementar")

    @discord.slash_command(name = "forceplay", description = "salta una o mas canciones")
    async def forceplay(self, ctx, posición: int):
        await ctx.respond("Sin implementar")

    @discord.slash_command(name = "skip", description = "salta una o mas canciones")
    @option('posición', int, description="Posición en la que se encuentra en la cola")
    async def skip(self, ctx, posición: int = None):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "remove", description = "Quita una cancion de la cola a eleccion, vea la posicion de la cancion con /queue")
    async def remove(self, ctx, posición: int):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "pause", description = "Pausa la reproduccion")
    async def pause(self, ctx,):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "resume", description = "reanuda la reproduccion")
    async def resume(self, ctx,):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "stop", description = "Detiene la reproduccion")
    async def stop(self, ctx,):
        await ctx.respond("Sin implementar")     
        
    @discord.slash_command(name = "queue", description = "Muestra la cola de reproduccion")
    async def queue(self, ctx,):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "clear", description = "Limpia la cola")
    async def clear(self, ctx,):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "loop", description = "Activa o desactiva el loop de la cola")
    async def loop(self, ctx,):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "leave", description = "Desconecta el bot del canal de voz")
    async def leave(self, ctx,):
        await ctx.respond("Sin implementar")


async def addToQueue(arg):
    """addToQueue() llama a la funcion a la que corresponde la busqueda
    
    spotifyPlaylistSeach():
        Esta funcion solo admite links de playlist de Spotify
        
    spotifySearch():
        Esta funcion solo admite links de canciones infividuales de Spotify
         
    youTubePlaylistSearch():
        Esta funcion solo admite Links de playlists de Youtube
        
    YouTubeSearch():
        Esta funcion solo admite links de canciones individuales de Youtube
   
    Args:
        arg (str): Una URL de YT/spotify/Nombre de la cancion
        
    Datos retornados:
    check (boolean o str): 
    result (list o None):
    """
    
    check = spotifyPlaylistSeach(arg)
    check = spotifySearch(arg)
    check = youTubePlaylistSearch(arg)
    check = youtubeVideoSearch(arg)   
    check = YouTubeSearch(arg)
    
    
        
async def spotifyPlaylistSeach(arg):
    # Extraer el ID de la lista de reproducción desde la URL
    playlist_id = arg.split('/')[-1].split('?')[0]

    # Obtener información de la lista de reproducción
    playlist_info = sp.playlist(playlist_id)

    # Crear una lista para almacenar los diccionarios de canciones
    SearchList = []

    # Iterar sobre las pistas de la lista de reproducción y guardar información en la lista spotify_list
    for track in playlist_info['tracks']['items']:
        song_name = track['track']['name']
        artist_name = track['track']['artists'][0]['name']
        SearchList.append(Structures.SpotifyInstance(song_name, artist_name))
        
    return YouTubeSearch(SearchList)
        
async def spotifySearch(arg):
    # Extraer el ID de la canción desde la URL
    track_id = arg.split('/')[-1].split('?')[0]

    # Obtener información de la canción
    track_info = sp.track(track_id)

    # Obtener el nombre de la canción y el nombre del artista
    song_name = track_info['name']
    
    # Tomando solo el primer artista de la lista
    artist_name = track_info['artists'][0]['name']
    
    # Formato de busqueda para YT
    Search = Structures.SpotifyInstance(song_name, artist_name)
    return YouTubeSearch(Search)

async def youTubePlaylistSearch(arg):
    playlist = Playlist(arg)
    Playlist_URL = list(Playlist.video_urls)
    check = []
    for url in Playlist_URL:
        try:
            video = YouTube(url)
            check.append((True, Structures.YoutubeInstance(video.title, video.author)))
        except Exception as e:
            check.append((False, e))
        
async def youtubeVideoSearch(arg):
    try:
        video = YouTube(arg)
        YTInstance = Structures.YoutubeInstance(video.title, video.author, video.length, video.thumbnail_url)
        return (True, YTInstance)
    except Exception as e:
        return (False, e)

async def YouTubeSearch(arg):
    if not isinstance(arg, list):
        videos_data = [arg]
    else:
        videos_data = arg
        
    check = []
    
    for data in videos_data:
        try:
            searcher = VideosSearch(data, limit = 1)
            result = searcher.result()['result'][0]['link']
            check.append((True, result))
        except Exception as e:
            check.append((False, e))
            
    return check       
        
def setup(bot):
    bot.add_cog(Music_Cog(bot))