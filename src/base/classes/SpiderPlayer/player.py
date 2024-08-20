import asyncio
import re
from typing import List
from colorama import Fore
import discord
from discord.ext import commands

from base.classes.Youtube import Youtube
from base.interfaces.ISong import ISong
from base.utils.colors import Colours

yt = Youtube()

class Player():
    """
    Clase que representa a un reproductor en el bot SpiderBot.

    Atributos:
    - guild: discord.Guild: El servidor al que pertenece el reproductor.
    - queue: list: La lista de canciones en la cola de reproducción del reproductor.
    - volume: int: El volumen de reproducción del reproductor.
    - current_song: any: La canción actual que se está reproduciendo.
    - voiceChannel: discord.VoiceChannel: El canal de voz al que está conectado el reproductor.
    - textChannel: discord.TextChannel: El canal de texto asociado al reproductor.
    - stoped: bool: Indica si el reproductor está detenido.
    - loop: bool: Indica si el reproductor está en modo bucle.
    - playingMsg: discord.Message: El mensaje que muestra la información de la canción que se está reproduciendo.
    - should_reconnect: bool: Indica si el reproductor debe reconectarse al canal de voz anterior.
    - last_voice_channel: discord.VoiceChannel: El último canal de voz al que estaba conectado el reproductor.
    - bot: commands.Bot: El bot de discord.py al que pertenece el reproductor.
    - sourceVolume: int: El volumen de la fuente de audio del reproductor.
    - inactivity_timer: asyncio.Task: El temporizador de inactividad del reproductor.
    - last_Interaction: discord.Interaction: La última interacción que activó el reproductor.
    - last_song: any: La última canción que se reprodujo en el reproductor.
    - pausedDisconnect: bool: Indica si el reproductor se desconectó por inactividad mientras estaba pausado.
    """
    
    guild: int
    queue: List[ISong]
    current_song: ISong
    voiceChannel: discord.VoiceChannel
    textChannel: discord.TextChannel
    stoped: bool
    loop: bool
    playingMsg: discord.Message
    should_reconnect: bool
    last_voice_channel: discord.VoiceChannel
    inactivity_timer: asyncio.Task
    last_Interaction: discord.Interaction
    last_song: ISong
    pausedDisconnect: bool
    sourceVolume: int
    volume: int

    def __init__(self, guild: int, bot) -> None:
        from base.classes.Bot import CustomBot
        """
        Inicializa una instancia de la clase player.

        Parámetros:
        - guild: int: El id del servidor al que pertenece el reproductor.
        """
        
        self.bot: CustomBot = bot
        self.guild = guild
        self.queue = []
        self.current_song = None
        self.voiceChannel = None
        self.textChannel = None
        self.stoped = False
        self.loop = False
        self.playingMsg = None
        self.should_reconnect = True
        self.last_voice_channel = None
        self.inactivity_timer = None
        self.last_Interaction = None
        self.last_song = None
        self.pausedDisconnect = False
        self.sourceVolume = 100
        self.volume = 25

        self.LoadGuildData()
    
    def LoadGuildData(self):
        """
        Carga los datos del servidor desde la base de datos.
        """
        if "guilds" not in self.bot.db_manager.db.list_collection_names():
            self.bot.db_manager.createCollection("guilds")
        
        guildData = self.bot.db_manager.getCollection("guilds").find_one({"_id": self.guild})
        
        if guildData is None:
            guildData = {
                "_id": self.guild,
                "music-setting": {
                    "sourcevolumen": 100,
                    "volume": 25,
                }
            }
            self.bot.db_manager.getCollection("guilds").insert_one(guildData)
            return
        
        self.sourceVolume = guildData["music-setting"]["sourcevolumen"]
        self.volume = guildData["music-setting"]["volume"]

    async def joinVoiceChannel(self, voiceChannel: discord.VoiceChannel):
            """
            Conecta al bot al canal de voz especificado.

            Parámetros:
            - voiceChannel (discord.VoiceChannel): El canal de voz al que se desea conectar.

            Retorna:
            - str: Un mensaje indicando si se ha conectado correctamente al canal de voz.
            """

            self.should_reconnect = True

            if self.voiceChannel is not None and self.voiceChannel.channel == voiceChannel:
                # print(f"{Fore.YELLOW}[Debug] Bot ya está conectado a '{voiceChannel.name}'.")
                return "connected"
                
            try:
                if self.voiceChannel is not None and self.voiceChannel.is_connected():
                    await self.voiceChannel.move_to(voiceChannel)
                    # print(f"{Fore.YELLOW}[Debug] Bot movido a '{voiceChannel.name}'.")
                    return "connected"
                self.voiceChannel = voiceChannel
                self.voiceChannel = await voiceChannel.connect()
                # print(f"{Fore.YELLOW}[Debug] Bot conectado a '{voiceChannel.name}'.")
                return "connected"
            except discord.ClientException as e:
                print(f"{Fore.RED}[Error] cliente:\n", e)
                # return False

            except Exception as e:
                print(f"{Fore.RED}[Error] general:\n", e)
                # return False

    async def leaveVoiceChannel(self):
        """
        Desconecta al reproductor de un canal de voz.
        """
        if self.voiceChannel is not None:
            await self.voiceChannel.disconnect()
            self.voiceChannel = None
            return "disconnected"
        
        return "not_connected"

    async def play(self, interaction: discord.Interaction = None):
        from buttons.playerMenu import playerMenu

        print(f"{Fore.BLUE}[Info] Reproduciendo en '{interaction.guild.name}'.")

        if interaction is None:
            interaction = self.last_Interaction  

        self.textChannel = interaction.channel
        self.last_Interaction = interaction

        if self.voiceChannel is None:
            return
        
        if len(self.queue) == 0:
            self.reset_inactivity_timer(interaction.guild_id)
            return

        if self.voiceChannel.is_playing():
            return "playing"
        
        if self.voiceChannel.is_paused():
            self.voiceChannel.resume()
            return "resumed"
        
        if not self.voiceChannel.is_connected():
            return "not connected"
        
        if self.stoped:
            self.stoped = False
            return "stoped"
        
        video = self.queue.pop(0)
        self.current_song = video
        try:
            stream, video.thumbnail = await yt.get_audio_stream(video.url)

            def after_play(e):
                self.last_song = video
                print(f"{Fore.BLUE}[Info] Canción '{video.title}' finalizada en '{interaction.guild.name}'.")
                self.bot.loop.create_task(self.play(interaction))
                if self.loop:
                    self.add_song(video)
                    print(f"{Fore.BLUE}[Info] loop activado - agregando '{video.title}' a la cola")

            self.voiceChannel.play(stream, after=after_play)
            self.last_song = video
            


        except Exception as e:
            print(f"{Fore.RED}[Error] No se pudo reproducir la canción '{video.title}' en '{interaction.guild.name}'.")
            print(f"{Fore.RED}[Error] {e}")
            await self.play(interaction)

        self.voiceChannel.source = discord.PCMVolumeTransformer(self.voiceChannel.source, volume=self.sourceVolume / 100)
        self.voiceChannel.source.volume = self.volume / 100

        if self.playingMsg is not None:
            await self.playingMsg.edit(view=None)

        self.playingMsg = await playerMenu(interaction, self, video).Send()
        
    async def back(self):
        if self.last_song is None:
            return "no last song"

        if self.loop and self.last_song is self.queue[-1]:
            self.queue.pop()

        self.add_song_at(self.last_song)
        self.voiceChannel.stop()

    async def resume(self):
        self.voiceChannel.resume()

    async def stop(self):
        self.voiceChannel.stop()
        self.stoped = True

    async def pause(self):
        self.voiceChannel.pause()

        self.reset_inactivity_timer(self.guild)

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

    def add_song_at(self, song, index = 0):
        """
        Agrega una canción a la cola de reproducción del reproductor en una posición específica.

        Parámetros:
        - song: any: La canción a agregar.
        - index: int: La posición en la que se agregará la canción.
        """
        self.queue.insert(index, song)

    def add_songs_at_start(self, songs):
        """
        Agrega una lista de canciones al inicio de la cola de reproducción del reproductor.

        Parámetros:
        - songs: list: La lista de canciones a agregar.
        """
        self.queue = songs + self.queue

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
    
    def setDuration(self, duration):
        hours, remainder = divmod(duration, 3600)
        minutes, seconds = divmod(remainder, 60)

        # Redondear minutos si los segundos son 30 o más
        if seconds >= 30:
            minutes += 1
        if minutes >= 60:
            minutes = 0
            hours += 1

        # Ajustar para que los segundos se muestren siempre
        # Convierte minutes, hours y seconds a enteros antes de formatear
        hours = int(hours)
        minutes = int(minutes)
        seconds = int(seconds) % 60  # Asegurar que los segundos sean correctos después de redondear minutos

        # Construir el string de duración basado en las condiciones de horas, minutos y segundos
        duration_parts = []
        if hours > 0:
            duration_parts.append(f"{hours:02d}")
        if minutes > 0 or hours > 0:
            duration_parts.append(f"{minutes:02d}")
        duration_parts.append(f"{seconds:02d}")  # Incluir siempre los segundos

        return ":".join(duration_parts)
    
    async def destroy(self):
        if not self.voiceChannel.is_paused():
            self.queue.clear()
            self.last_song = None

        if self.voiceChannel is not None:
            self.voiceChannel.stop()
            await self.voiceChannel.disconnect()

        if self.playingMsg is not None:
            await self.playingMsg.edit(view=None)

        if self.pausedDisconnect:
            self.add_song_at(self.current_song)

        self.volume = 25
        self.current_song = None
        self.voiceChannel = None
        self.textChannel = None
        self.stoped = False
        self.loop = False
        self.playingMsg = None
        self.should_reconnect = True
        
        return "destroyed"
    
    async def disconnect_for_inactivity(self, guild_id):
        await asyncio.sleep(60)
        guild = self.bot.get_guild(guild_id)
        if self.voiceChannel and not self.voiceChannel.is_playing():
            self.pausedDisconnect = True if self.voiceChannel.is_paused() else False
            await self.voiceChannel.disconnect()
            await self.playingMsg.edit(view=None)
            await self.textChannel.send(embed=discord.Embed(
                title="Desconexión por inactividad", 
                description="Me he desconectado por inactividad.", 
                color=Colours.default()
                ))
            await self.destroy()
            print(f"{Fore.BLUE}[Voice] Bot desconectado de '{guild.name}' por inactividad.")

    def reset_inactivity_timer(self, guild_id):
        if self.inactivity_timer:
            self.inactivity_timer.cancel()

        print(f"{Fore.BLUE}[Voice] Temporizador de inactividad reiniciado.")
        self.inactivity_timer = asyncio.create_task(self.disconnect_for_inactivity(guild_id))
