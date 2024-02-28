import discord, os, re
import yt_dlp as youtube_dl

from discord.ext import commands, tasks
from discord import option
from discord.commands.context import ApplicationContext
from discord import FFmpegPCMAudio
from discord import Embed

from utils.logic.structure import MediaPlayerStructure
from utils.logic import url_handler

class MusicPlayer(MediaPlayerStructure):
    def __init__(self, bot, guild) -> None:        
        super().__init__(bot=bot, guild=guild)
        self.Queue = []
        self.is_loop = False
        self.PlayingSong = {}
        self.disconnect_task = None
        self.AfterPlayingTask = None
        self.LastCtx = None
        self.voice_clients = None
        print(f"Intancia de MusicPlayer creada para {self.guild.id}")
    
    async def PlaySong(self, ctx: ApplicationContext, search: str):        
        voice_client = await self.join(ctx)
        if not voice_client:
            return
        
        if search:
            print(search)
            await self.AddSongs(search)
            await ctx.send("se agrego a la cola")
            
        if voice_client.is_playing():
            return
            
        if len(self.Queue) == 0:
            await ctx.send("No hay mas canciones en la cola")
            return
        
        ydl_opts = {
            'quiet': False,
            'format': 'bestaudio/best',  # Descargar el mejor formato de audio disponible
            'outtmpl': f'temp/%(title)s.%(ext)s',  # Nombre del archivo de salida
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',  # Especificar MP3 como el códec preferido
            }],
        }

        video_url = self.Queue[0]
        print (video_url)
        self.Queue.pop(0)
        
        if self.is_loop == True:
            self.Queue.append(video_url)
        
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            try:
                info_dict = ydl.extract_info(video_url, download=False)
                
                song_title = info_dict.get('title', 'Canción sin título')
                song_artist = info_dict.get('channel', 'Artista desconocido')
                song_duration = info_dict.get('duration', 'Duración desconocida')
                song_thumbnail = info_dict.get('thumbnail', 'Sin foto de portada')
                                
                ydl.download([video_url])  # Descargar la canción
                video_file_path = os.path.join('temp', f"{info_dict['title']}.mp3")

                print(f"Se descargo: {video_file_path}")

                audio_source = FFmpegPCMAudio(video_file_path)
                voice_client.play(audio_source)
                
                embed = Embed(title="Reproduciendo", color=0x120062)
                embed.add_field(name=song_title, value=song_artist, inline=True)
                embed.add_field(name=f'Duracion: {self.DurationFormat(seconds=song_duration)}', value=f'[Ver en Youtube]({video_url})')
                embed.set_image(url=song_thumbnail)
                
                await ctx.send(embed=embed)
                 
                self.PlayingSong = { 
                    'title': song_title,
                    'Artista': song_artist,
                    'Duración': song_duration,
                    'thumbnail': song_thumbnail
                }
                
                self.LastCtx = ctx
            except youtube_dl.DownloadError as e:
                await ctx.send(f"Error al descargar la canción: {str(e)}")
        
    @commands.Cog.listener()
    async def on_voice_state_update(self, member, before, after):
        # Verifica si el bot está en un canal de voz
        if self.LastCtx.author.voice:
            voice_client = self.LastCtx.guild.voice_client  # Obtén el primer cliente de voz (puedes ajustar esto según tu caso)

            # Verifica si el bot estaba reproduciendo audio antes
            if not voice_client.is_playing():
                
                if not after.channel:
                    # Si el bot dejó de reproducir audio, realiza alguna acción aquí
                    self.PlaySong(self.LastCtx)
                
    async def AddSongs(self, search):
        result: tuple = (False, 'Link invalido')
        mediaplayers = [ url_handler.YoutubePlaylist(), url_handler.YoutubeVideo(), url_handler.SpotifyPlaylist(), url_handler.SpotifySong(), url_handler.YoutubeSearch() ]
        for player in mediaplayers:
            if player.check(search):
                result = player.search(search)
                break
        
        #! Agrega a la base de datos - TOCA CAMBIAR AL TENER LA BD
        for data in result:
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
                return ctx.guild.voice_client
            except discord.ClientException:
                return ctx.guild.voice_client
            except Exception as e:
                await ctx.send(f"¡Ocurrió un error al unirse al canal de voz: {e}")
                return None
        else:
            await ctx.send("¡Debes estar en un canal de voz para que el bot se una!")
            return None



