import traceback

from discord import Interaction

from base.classes.music.SongTypes import SpiderSongType
from base.utils.Logging.LogMessages import LogDebug, LogError, LogExitoso


class SingleVideo(SpiderSongType):
    """
    Clase SingleVideo que representa un video individual en el sistema SpiderBot.

    Atributos:
        - url (str): URL del video.
        - title (str): Título del video.
        - duration (float): Duración del video en segundos.
        - uploader (str): Nombre del usuario que subió el video.
        - thumbnail (str): URL de la miniatura del video.
        - timeLine (int): Línea de tiempo del video.

    Métodos:
        - __init__(self, url, title, duration, uploader, thumbnail=None):
        Inicializa una instancia de SingleVideo con los detalles proporcionados.
        - async send(self, interaction: Interaction):
        Envía el video agregado al canal de interacción.
        - print(self):
        Muestra los detalles del video agregado en la consola.
        - UploadDefault(self, queue: list):
        Sube el video a la cola de reproducción.
        - UploadFirst(self, queue):
        - __str__(self) -> str:
        Devuelve una representación en cadena del objeto SingleVideo.
    """

    url: str
    title: str
    duration: float
    uploader: str
    thumbnail: str
    timeLine: int

    def __init__(self, url, title, duration, uploader, thumbnail=None):
        self.url = url
        self.title = title
        self.duration = duration
        self.uploader = uploader
        self.thumbnail = None
        self.timeLine = 0

    async def send(self, interaction: Interaction):
        """
        Envía el video agregado al canal.
        """
        try:
            logger = LogExitoso(
                title=f"Video - {self.title}.",
                message=f"Se agrego a la cola.",
            )

            logger.print()
            await logger.send(interaction)
        except Exception as e:
            LogError(
                title=f"Error al enviar el video **{self.title}**.",
                message=f"Error: {e}",
            ).log(e)

    def print(self):
        """
        Muestra el video agregado en la consola.
        """
        try:
            logger = LogDebug(
                title=f"Video **{self.title}**",
                message=f"\tUploader: {self.uploader}\n\tUrl: {self.url}\n\tDuración: {self.duration}",
            )

            logger.print()
        except Exception as e:
            LogError(
                title=f"Error al enviar el video **{self.title}**.",
                message=f"Error: {e}",
            ).log(e)

    def UploadDefault(self, queue: list):
        """
        Sube el video a la cola de reprodución.
        """
        try:
            queue.append(self)
            logger = LogDebug(
                title=f"Video **{self.title}** agrgado.",
                message=f"Duración: {self.duration}",
            )
            logger.print()
        except Exception as e:
            LogError(
                title=f"Error al subir el video **{self.title}**.",
                message=f"Error: {e}",
            ).log(e)

    def UploadFirst(self, queue):
        """
        Sube el video a la cola de reproducción en la primera posición.
        """
        try:
            queue.insert(0, self)
            LogDebug(
                title=f"Video **{self.title}** agrgado.",
                message=f"Duración: {self.duration}",
            ).print()
        except Exception as e:
            LogError(
                title=f"Error al subir el video **{self.title}**.",
                message=f"Error: {e}",
            ).log(e)

    def __str__(self) -> str:
        return {
            "title": self.title,
            "url": self.url,
            "duration": self.duration,
            "uploader": self.uploader,
        }
