from typing import List
from colorama import Fore
import discord

from base.classes.Youtube import Youtube
from base.interfaces.ISong import ISong

yt = Youtube()

class player():
    """
    Clase que representa a un reproductor en el bot SpiderBot.

    Atributos:
    - guild: discord.Guild: El servidor al que pertenece el reproductor.
    - queue: list: La lista de canciones en la cola de reproducción del reproductor.
    - volume: int: El volumen de reproducción del reproductor.
    - current_song: any: La canción actual que se está reproduciendo.
    - voiceChannel: discord.VoiceChannel: El canal de voz al que está conectado el reproductor.
    - textChannel: discord.TextChannel: El canal de texto asociado al reproductor.
    """

    def __init__(self, guild, bot) -> None:
        """
        Inicializa una instancia de la clase player.

        Parámetros:
        - guild: discord.Guild: El servidor al que pertenece el reproductor.
        """
        self.bot = bot
        self.guild = guild
        self.queue: List[ISong] = []
        self.volume = 50
        self.current_song = None
        self.voiceChannel = None
        self.textChannel = None

    async def joinVoiceChannel(self, voiceChannel: discord.VoiceChannel):
        """
        Conecta al reproductor a un canal de voz.

        Parámetros:
        - voiceChannel: discord.VoiceChannel: El canal de voz al que se conectará el reproductor.
        """
        if self.voiceChannel is not None and self.voiceChannel.channel == voiceChannel:
            return "connected"
            
        try:
            self.voiceChannel = voiceChannel
            self.voiceChannel = await voiceChannel.connect()
            return "connected"
        except discord.ClientException as e:
            print(f"{Fore.RED}[Error] cliente:\n", e)

        except Exception as e:
            print(f"{Fore.RED}[Error] general:\n", e)

    async def leaveVoiceChannel(self):
        """
        Desconecta al reproductor de un canal de voz.
        """
        if self.voiceChannel is not None:
            await self.voiceChannel.disconnect()
            self.voiceChannel = None

    async def play(self, interaction: discord.Interaction):
        if self.voiceChannel is None:
            return
        
        if len(self.queue) == 0:
            return

        if self.voiceChannel.is_playing():
            return "playing"
        
        if self.voiceChannel.is_paused():
            self.voiceChannel.resume()
            return "resumed"
        
        video = self.queue.pop(0)
        
        stream = await yt.get_audio_stream(video.url)
        self.voiceChannel.play(stream[1], after=lambda e: (self.bot.loop.create_task(self.play(interaction)), print(f"{Fore.GREEN}[Info] Canción finalizada.")))

        await interaction.channel.send(embed=discord.Embed(
            title=f"Reproduciendo - **{video.title}**", 
            description=f"Duración: {video.duration}",
            color=discord.Color.green())
            .add_field(name="Canal", value=video.uploader)
            .add_field(name='Cola:', value=len(self.queue))
            )


        


    def add_song(self, song):
        """
        Agrega una canción a la cola de reproducción del reproductor.

        Parámetros:
        - song: any: La canción a agregar.
        """
        self.queue.append(song)

    def add_songs(self, songs):
        """
        Agrega una lista de canciones a la cola de reproducción del reproductor.

        Parámetros:
        - songs: list: La lista de canciones a agregar.
        """
        self.queue.extend(songs)

    def remove_song(self, index):
        """
        Elimina una canción de la cola de reproducción del reproductor.

        Parámetros:
        - index: int: El índice de la canción a eliminar.
        """
        self.queue.pop(index)

    def get_queue(self):
        """
        Obtiene la lista de canciones en la cola de reproducción del reproductor.

        Retorna:
        - list: La lista de canciones en la cola de reproducción.
        """
        return self.queue
    
    def clear_queue(self):
        """
        Limpia la cola de reproducción del reproductor.
        """
        self.queue.clear()

    def get_current_song(self):
        """
        Obtiene la canción actual que se está reproduciendo.

        Retorna:
        - any: La canción actual que se está reproduciendo.
        """
        return self.current_song
    
    def set_current_song(self, song):
        """
        Establece la canción actual que se está reproduciendo.

        Parámetros:
        - song: any: La canción actual que se está reproduciendo.
        """
        self.current_song = song

    def get_volume(self):
        """
        Obtiene el volumen de reproducción del reproductor.

        Retorna:
        - int: El volumen de reproducción.
        """
        return self.volume
    
    def set_volume(self, volume):
        """
        Establece el volumen de reproducción del reproductor.

        Parámetros:
        - volume: int: El volumen de reproducción.
        """
        self.volume = volume

    def get_voice_channel(self):
        """
        Obtiene el canal de voz al que está conectado el reproductor.

        Retorna:
        - discord.VoiceChannel: El canal de voz al que está conectado el reproductor.
        """
        return self.voiceChannel
    
    def set_voice_channel(self, voiceChannel):
        """
        Establece el canal de voz al que está conectado el reproductor.

        Parámetros:
        - voiceChannel: discord.VoiceChannel: El canal de voz al que está conectado el reproductor.
        """
        self.voiceChannel = voiceChannel

    def get_text_channel(self):
        """
        Obtiene el canal de texto asociado al reproductor.

        Retorna:
        - discord.TextChannel: El canal de texto asociado al reproductor.
        """
        return self.textChannel
    
    def set_text_channel(self, textChannel):
        """
        Establece el canal de texto asociado al reproductor.

        Parámetros:
        - textChannel: discord.TextChannel: El canal de texto asociado al reproductor.
        """
        self.textChannel = textChannel

    def get_guild(self):
        """
        Obtiene el servidor al que pertenece el reproductor.

        Retorna:
        - discord.Guild: El servidor al que pertenece el reproductor.
        """
        return self.guild