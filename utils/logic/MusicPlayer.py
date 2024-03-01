import discord, os, re
import yt_dlp as youtube_dl

from discord.ext import commands, tasks
from discord import option
from discord.commands.context import ApplicationContext
from discord import FFmpegPCMAudio
from discord import Embed

from utils.logic.structure import MediaPlayerStructure
from utils.logic import url_handler
from utils.logic.Song import SongData

from utils.interface.Messages import MensajesEmbebidos
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('YT_KEY')


class MusicPlayer(MediaPlayerStructure):
    def __init__(self, bot, guild) -> None:        
        super().__init__(bot=bot, guild=guild)
        self.Queue = []
        self.is_loop = False
        self.PlayingSong = {}
        self.LastCtx = None
        self.stoped = False
        self.Messages: MensajesEmbebidos = MensajesEmbebidos()
        
        print(f"Intancia de MusicPlayer creada para {self.guild.id}")
    
    def setStoped(self, check: bool):
        self.stoped = check
        
    async def Stop(self, ctx: ApplicationContext):
        voice_client: discord.VoiceClient = ctx.voice_client
        if not voice_client is None:
            voice_client.stop()
            self.setStoped(False)
            await self.Messages.StopMessage(ctx)

    async def PlaySong(self, ctx: ApplicationContext, search: str):
        if self.stoped:
            return
                
        voice_client: discord.VoiceClient = await self.join(ctx)
        if not voice_client:
            return
        
        if search:
            await self.AddSongs(search)
            await ctx.send(embed=Embed(description="se agrego a la cola"))
            
        if voice_client.is_playing():
            return
            
        if len(self.Queue) == 0:
            await ctx.send(embed=Embed(description="No hay mas canciones en la cola"))
            return
        
        
        ydl_opts = {
            'api_key': 'AIzaSyCf4qHNcwgJjOBYN0SGiikTmpMF5gBHcEs',
            'quiet': False,
            'format': 'bestaudio/best',  # Descargar el mejor formato de audio disponible
            'outtmpl': f'temp/%(id)s.%(ext)s',  # Nombre del archivo de salida
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',  # Especificar MP3 como el códec preferido
            }],
        }

        video_url = self.Queue[0]
        self.Queue.pop(0)
        
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            try:
                Song = SongData(video_url)
                info_dict = Song.info

                ydl.download([video_url])  # Descargar la canción
                video_file_path =  os.path.join('temp', f"{info_dict['id']}.mp3")

                print(f"Se descargo: {video_file_path}")
                                      
                audio_source = FFmpegPCMAudio(video_file_path)
                voice_client.play(audio_source, after=lambda e: (
                    self.Queue.append(video_url) if self.is_loop else None,
                    self.bot.loop.create_task(self.PlaySong(self.LastCtx, None)),
                    os.remove(video_file_path)
                    )
                )
                
                self.PlayingSong = { 
                    'title': Song.title,
                    'Artista': Song.artist,
                    'Duración': Song.duration,
                    'thumbnail': Song.thumbnail
                }
                
                self.LastCtx = ctx
                
                await self.Messages.PlayMessage(ctx, Song.title, Song.artist, Song.duration, video_url, Song.thumbnail)
      
            except youtube_dl.DownloadError as e:
                await ctx.send(f"Error al descargar la canción: {str(e)}")
                
    async def AddSongs(self, search: str):
        result: tuple = (False, 'Link invalido')
        mediaplayers = [ url_handler.YoutubePlaylist(), url_handler.YoutubeVideo(), url_handler.SpotifyPlaylist(), url_handler.SpotifySong(), url_handler.YoutubeSearch() ]
        for player in mediaplayers:
            if player.check(search):
                result = player.search(search)
                break
        
        #! Agrega a la base de datos - TOCA CAMBIAR AL TENER LA BD
        for data in result:
            print(data)
            if data[0] == True:
                self.Queue.append(data[1])  
                   
    async def join(self, ctx: ApplicationContext):
        # Verificar si el autor del comando está en un canal de voz
        if ctx.author.voice:
            try:
                # Unirse al canal de voz del autor
                channel = ctx.author.voice.channel
                voice_channel = await channel.connect()
                await ctx.send(f'Conectado al canal de voz: {channel.name}')
                return ctx.voice_client
            except discord.ClientException:
                return ctx.voice_client
            except Exception as e:
                await ctx.send(f"¡Ocurrió un error al unirse al canal de voz: {e}")
                return None
        else:
            await ctx.send("¡Debes estar en un canal de voz para que el bot se una!")
            return None

    async def loop(self, ctx: ApplicationContext):
        self.is_loop = not self.is_loop
        await self.Messages.LoopMessage(ctx, self.is_loop)

    async def leave(self, ctx: ApplicationContext):
        if ctx.voice_client:
            ctx.voice_client.disconnect()
            await self.Messages.LeaveMessage(ctx)
            #ctx.send(embed=Embed(description="Me desconecte con exito"))
        else:
            await self.Messages.LeaveMessage(ctx)
            #ctx.send(embed=Embed(description="No estoy en un canal de voz"))