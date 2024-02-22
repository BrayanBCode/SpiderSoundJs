# Imports basicos
import discord, os
from discord.ext import commands

# Imports utiles para los Cogs
from utils.logic import Structures
from discord import option

# Imports para YT
from youtubesearchpython import VideosSearch
from pytube import Playlist, YouTube

from utils.logic import url_handler

# Imports para API Spotify
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

# Imports para reproduccion de audio
from discord import FFmpegPCMAudio
import asyncio

# Imports de Interaz
from discord import Embed
from typing import List




#! SOLUCION TEMPORAL - DEBE IMPLEMENTARSE LA BD
serverQueue = {}
VCInstance = {}

class Music_Cog(commands.Cog):
    def __init__(self, bot: discord.bot):
        self.bot = bot
    
    @discord.slash_command(name = "play", description = "Agrega y reproduce musica desde YT")
    @option('search', str, description="Nombre o url de la cancion")
    async def play(self, ctx, search: str = None):
        await ctx.defer()
        try:
            channel = ctx.author.voice.channel
        except Exception as e:
            channel = False
        voice_client = ctx.guild.voice_client
        Guild = ctx.guild
        
        """Verifica si el autor de comando esta conectado a un canal de voz"""
        if not voice_client:
            if channel:
                await channel.connect()
            else:
                await ctx.followup.send(embed=Embed(description='❌ Debe estar conectado a un canal de voz'))                          
        if search != None:
            await addToQueue(search, Guild.id)

        emb = await PlaySong(ctx)
        await ctx.followup.send(embed=emb)
  
        #await asyncio.create_task(await PlaySong(ctx))

    @discord.slash_command(name = "forceplay", description = "salta una o mas canciones")
    async def forceplay(self, ctx, url: str):
        await ctx.respond("Sin implementar")

    @discord.slash_command(name = "skip", description = "salta una o mas canciones")
    @option('posición', int, description="Posición en la que se encuentra en la cola")
    async def skip(self, ctx, posición: int = None):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "remove", description = "Quita una cancion de la cola a eleccion, vea la posicion de la cancion con /queue")
    async def remove(self, ctx, posición: int):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "pause", description = "Pausa la reproduccion")
    async def pause(self, ctx):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "resume", description = "reanuda la reproduccion")
    async def resume(self, ctx):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "stop", description = "Detiene la reproduccion")
    async def stop(self, ctx):
        await ctx.respond("Sin implementar")     
        
    @discord.slash_command(name = "queue", description = "Muestra la cola de reproduccion")
    async def queue(self, ctx):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "clear", description = "Limpia la cola")
    async def clear(self, ctx):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "loop", description = "Activa o desactiva el loop de la cola")
    async def loop(self, ctx):
        await ctx.respond("Sin implementar")
        
    @discord.slash_command(name = "leave", description = "Desconecta el bot del canal de voz")
    async def leave(self, ctx):
        await ctx.respond("Sin implementar")
        
    @commands.Cog.listener()
    async def on_guild_join(self, guild):
        serverQueue[guild.id] = []
        
    @commands.Cog.listener()
    async def on_ready(self) -> None:
        guilds = self.bot.guilds
        for guild in guilds:
            serverQueue[guild.id] = []
        

async def addToQueue(arg: str, guild: int):
    result: tuple = (False, 'Link invalido')
    mediaplayers = [url_handler.YoutubePlaylist(), url_handler.YoutubeVideo(), url_handler.SpotifyPlaylist(), url_handler.SpotifySong(), url_handler.YoutubeSearch()]
    for player in mediaplayers:
        if player.check(arg):
            result = player.search(arg)
            break           
    
    #! Agrega a la base de datos - TOCA CAMBIAR AL TENER LA BD
    for data in result:
        serverQueue[guild].append(data[1])
        print(f'Se agrego {data[1]} al server {guild}')          
                
async def PlaySong(ctx):
    if len(serverQueue[ctx.guild.id]) > 0:
        guild = ctx.guild.id
        voice_client = ctx.voice_client

        video_url = serverQueue[guild][0]
        print(serverQueue[guild][0])
        serverQueue[guild].pop(0)
        print(serverQueue[guild])
        
        try:
            video = YouTube(video_url)
            video_stream = video.streams.get_audio_only()
            output_path = 'temp'
            video_path = os.path.join(output_path, video_stream.default_filename)
            video_stream.download(output_path=output_path)

            audio_source = FFmpegPCMAudio(video_path)   
            voice_client.play(audio_source)     
            
            duration = video.length
            mins, secs = divmod(duration, 60)
            hours, mins = divmod(mins, 60)
            duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)

            embed = Embed(title="Reproduciendo", color=0x120062)
            embed.add_field(name=video.title, value=video.author, inline=True)
            embed.add_field(name=f'Duracion: {duration_formatted}', value=f'[Ver en Youtube]({video_url})')
            embed.set_thumbnail(url=video.thumbnail_url)

            return embed
        
        except Exception as e:
            return Embed(description=f'Error de reproduccion: {e}')
            
    else:
        return Embed(description='No hay canciones en al cola')
        
def setup(bot):
    bot.add_cog(Music_Cog(bot))