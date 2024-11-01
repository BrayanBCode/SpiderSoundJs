import asyncio
from typing import List

import discord
from colorama import Fore

from base.classes.music.Video import SingleVideo
from base.classes.Youtube import Youtube
from base.db.models.entries.GuildEntrie import GuildEntrie
from base.db.templates.DefaultDatas import DefaultData
from base.utils.Logging.LogMessages import LogAviso, LogDebug, LogError, LogExitoso


class Player:
    """
    Clase que representa a un reproductor en el bot SpiderBot.

    Atributos:
    - guild: discord.Guild: El servidor al que pertenece el reproductor.
    - queue: list: La lista de canciones en la cola de reproducción del reproductor.
    - volume: int: El volumen de reproducción del reproductor.
    - current_song: any: La canción actual que se está reproduciendo.F
    - VoiceClient: discord.VoiceChannel: El canal de voz al que está conectado el reproductor.
    - textChannel: discord.TextChannel: El canal de texto asociado al reproductor.
    - stoped: bool: Indica si el reproductor está detenido.
    - loop: bool: Indica si el reproductor está en modo bucle.
    - playingMsg: discord.Message: El mensaje que muestra la información de la canción que se está reproduciendo.
    - shouldReconnect: bool: Indica si el reproductor debe reconectarse al canal de voz anterior.
    - last_voice_channel: discord.VoiceChannel: El último canal de voz al que estaba conectado el reproductor.
    - bot: commands.Bot: El bot de discord.py al que pertenece el reproductor.
    - sourceVolume: int: El volumen de la fuente de audio del reproductor.
    - inactivity_timer: asyncio.Task: El temporizador de inactividad del reproductor.
    - last_Interaction: discord.Interaction: La última interacción que activó el reproductor.
    - lastSong: any: La última canción que se reprodujo en el reproductor.
    - pausedDisconnect: bool: Indica si el reproductor se desconectó por inactividad mientras estaba pausado.
    """

    guild: GuildEntrie
    queue: List[SingleVideo]
    current_song: SingleVideo
    VoiceClient: discord.VoiceClient
    textChannel: discord.TextChannel
    stoped: bool
    loop: bool
    playingMsg: discord.Message
    shouldReconnect: bool
    last_voice_channel: discord.VoiceChannel
    DisconnectTimer: asyncio.Task
    last_Interaction: discord.Interaction
    lastSong: SingleVideo
    pausedDisconnect: bool
    sourceVolume: int
    volume: int
    autoPlay: bool
    yt: Youtube

    def __init__(self, guild: int, bot) -> None:
        from base.classes.Bot import CustomBot

        """
        Inicializa una instancia de la clase player.

        Parámetros:
        - guild: int: El id del servidor al que pertenece el reproductor.
        """

        self.bot: CustomBot = bot
        self.guild = None
        self.queue = []
        self.current_song = None
        self.VoiceClient = None
        self.textChannel = None
        self.stoped = False
        self.loop = False
        self.playingMsg = None
        self.shouldReconnect = True
        self.last_voice_channel = None
        self.DisconnectTimer = None
        self.last_Interaction = None
        self.lastSong = None
        self.pausedDisconnect = False
        self.yt = Youtube()

        # Cliente
        self.sourceVolume = 100
        self.volume = 25

        self.getConfig(guild)

    def getConfig(self, guildID):
        try:
            self.guild = GuildEntrie(
                mongoConnection=self.bot.DBConnect,
                guildData=self.bot.GuildTable.findOne({"_id": guildID}),
            )

            if self.guild._id is None:
                print(self.guild)
                self.guild = GuildEntrie(
                    mongoConnection=self.bot.DBConnect,
                    guildData={
                        "_id": guildID,
                        "music-setting": {
                            "sourcevolumen": 100,
                            "volume": 25,
                        },
                    },
                )
                self.bot.GuildTable.createGuild(self.guild)

            self.volume = self.guild.musicSetting.get("volume")
            self.sourceVolume = self.guild.musicSetting.get("sourcevolumen")

            LogExitoso(
                "Configuración de música creada",
                f"Configuración de música creada para '{self.bot.get_guild(self.guild._id).name}'.",
            ).print()
        except Exception as e:
            LogAviso(
                "Error al obtener configuración de música",
                f"No se pudo obtener la configuración de música: {e}",
            ).log(e)
            self.guild = GuildEntrie(
                mongoConnection=self.bot.DBConnect,
                guildData=DefaultData.DefaultGuild(guildID),
            )

    def getVoiceProtocol(self):
        return self.bot.get_guild(self.guild._id).voice_client
    
    async def joinVoiceChannelFromLastChannel(self):
        return self.joinVoiceChannel(self.last_voice_channel)


    async def joinVoiceChannel(self, voiceChannel: discord.VoiceChannel):
        """
        Conecta al bot a un canal de voz.
        """

        try:
            self.shouldReconnect = True

            if not voiceChannel:
                return "no channel"

            voice = self.getVoiceProtocol()

            if voice and voice.is_connected():
                self.VoiceClient = await voice.move_to(voiceChannel)
                self.last_voice_channel = voiceChannel

                return "connected"

            self.VoiceClient = await voiceChannel.connect()
            self.last_voice_channel = voiceChannel

            return "connected"

        except discord.ClientException as e:
            LogError(f"{Fore.RED}[Error] cliente:\n", e).log(e)

        except discord.errors.ConnectionClosed as e:
            LogError(f"{Fore.RED}[Error] conexión cerrada:\n", e).log(e)
            LogAviso(
                f"Intentando reconectar en '{voiceChannel.guild.name}' al canal {self.last_voice_channel.name}."
            ).print()

            await self.rePlayAfterError()

        except Exception as e:
            print(f"Error al intentar conectar al canal de voz: {e}")


    async def rePlayAfterError(self, max_retries=3, delay=5):
        """
        Intenta reconectar al canal de voz y reanudar la reproducción si hay canciones en la cola.
        """

        try:
            # Verificar si `last_voice_channel` está disponible
            if not self.last_voice_channel:
                print("Error: No se pudo reanudar la reproducción porque `last_voice_channel` es None.")
                return

            # Intentar reconectar con reintentos limitados
            retries = 0
            while retries < max_retries:
                try:
                    await self.joinVoiceChannel(self.last_voice_channel)
                    break  # Salir del bucle si se conecta con éxito
                except Exception as e:
                    print(f"Intento {retries + 1} de reconectar fallido: {e}")
                    retries += 1
                    await asyncio.sleep(delay)
            else:
                print("No se pudo conectar al canal de voz después de varios intentos.")
                return

            # Si la cola está vacía, no hay nada que reproducir
            if not self.queue:
                print("La cola está vacía. No hay canciones para reanudar.")
                return

            # Agregar la canción actual a la lista de reproducción y reanudar
            self.add_song_at(self.current_song)

            LogAviso(
                f"Intentando reanudar la reproducción en '{self.last_voice_channel.guild.name}'."
            ).print()

            # Intentar reproducir la canción
            await self.play()

        except Exception as e:
            print(f"Error al intentar reanudar la reproducción después de la desconexión: {e}")



    async def leaveVoiceChannel(self):
        """
        Desconecta al reproductor de un canal de voz.
        """
        if self.VoiceClient is not None:
            await self.VoiceClient.disconnect(force=True)
            self.VoiceClient = None
            return "disconnected"

        return "not_connected"

    async def play(self, interaction: discord.Interaction = None):
        from components.playerMenu import playerMenu

        if interaction is None:
            interaction = self.last_Interaction

        print(f"{Fore.BLUE}[Info] Reproduciendo en '{interaction.guild.name}'.")

        self.textChannel = interaction.channel
        self.last_Interaction = interaction

        if self.VoiceClient is None:
            return

        if len(self.queue) == 0:
            await self.RestartInactivityTimer()
            return

        if self.VoiceClient.is_playing():
            return "playing"

        if self.VoiceClient.is_paused():
            self.VoiceClient.resume()
            return "resumed"

        if not self.VoiceClient.is_connected():
            return "not connected"

        if self.stoped:
            self.stoped = False
            return "stoped"

        video = self.queue.pop(0)
        self.current_song = video
        try:
            stream = await self.yt.get_audio_stream(video)
            video.thumbnail = stream.thumbnail

            def after_play(e):
                self.lastSong = video
                print(
                    f"{Fore.BLUE}[Info] Canción '{video.title}' finalizada en '{interaction.guild.name}'."
                )
                self.bot.loop.create_task(self.play(interaction))
                if self.loop:
                    self.add_song(video)
                    print(
                        f"{Fore.BLUE}[Info] loop activado - agregando '{video.title}' a la cola"
                    )

                # if len(self.queue) == 0 and self.autoPlay:
                #     # parsedUrl = urlparse(video.url)
                #     # VideoID = parse_qs(parsedUrl.query).get("v")
                #     related = yt.searchRelatedSong(video)
                #     self.queue.append(related)
                #     LogExitoso(
                #         "AutoPlay activado",
                #         f"AutoPlay activado se agrego '{video.title}'."
                #     ).print()

            self.lastSong = video
            self.VoiceClient.play(stream.ffmpegAudio, after=after_play)

        except Exception as e:
            print(
                f"{Fore.RED}[Error] No se pudo reproducir la canción '{video.title}' en '{interaction.guild.name}'."
            )
            print(f"{Fore.RED}[Error] {e}")
            await self.play(interaction)

        self.VoiceClient.source = discord.PCMVolumeTransformer(
            self.VoiceClient.source, volume=self.sourceVolume / 100
        )
        self.VoiceClient.source.volume = self.volume / 100

        if self.playingMsg is not None:
            await self.playingMsg.delete()

        self.playingMsg = await playerMenu(interaction, self, video).Send()

    async def back(self):
        if self.lastSong is None:
            return "no last song"

        if self.loop and self.lastSong is self.queue[-1]:
            self.queue.pop()

        self.add_song_at(self.lastSong)
        self.VoiceClient.stop()

    async def resume(self):
        self.VoiceClient.resume()

    async def stop(self):
        self.VoiceClient.stop()
        self.stoped = True

    async def pause(self):
        self.VoiceClient.pause()

        await self.RestartInactivityTimer()

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

    def add_song_at(self, song, index=0):
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
        return self.VoiceClient

    def set_voice_channel(self, VoiceClient):
        """
        Establece el canal de voz al que está conectado el reproductor.

        Parámetros:
        - VoiceClient: discord.VoiceChannel: El canal de voz al que está conectado el reproductor.
        """
        self.VoiceClient = VoiceClient

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
        - entries.GuildEntrie: El servidor al que pertenece el reproductor.
        """
        return self.guild

    async def destroy(self):
        if self.VoiceClient is None:
            return "destroyed"

        if not self.VoiceClient.is_paused():
            self.queue.clear()
            self.lastSong = None

        if self.VoiceClient is not None:
            self.VoiceClient.stop()
            await self.VoiceClient.disconnect()

        if self.playingMsg is not None:
            await self.playingMsg.delete()

        if self.pausedDisconnect:
            self.add_song_at(self.current_song)

        self.current_song = None
        self.VoiceClient = None
        self.textChannel = None
        self.stoped = False
        self.loop = False
        self.playingMsg = None
        self.shouldReconnect = False

        return "destroyed"

    async def disconnectedByInactivity(self):
        # Si la cola de reproducción está vacía y no se está reproduciendo nada, se activa el temporizador
        if not self.queue and self.VoiceClient and not self.VoiceClient.is_playing() and len(self.VoiceClient.channel.members) == 1:
            return True

        if self.VoiceClient and self.VoiceClient.channel:
            if len(self.VoiceClient.channel.members) == 1:
                return True

    async def InactivityTimer(self):
        await asyncio.sleep(120)
        if await self.disconnectedByInactivity():
            await self.destroy()
            LogAviso(
                f"El bot ha sido desconectado del canal de voz por inactividad."
            ).print()

        self.inactivityTimer = None

    async def RestartInactivityTimer(self):
        if self.DisconnectTimer:
            self.DisconnectTimer.cancel()
        self.DisconnectTimer = asyncio.create_task(self.InactivityTimer())