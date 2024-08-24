import traceback
from discord import Interaction
from base.classes.music.SongTypes import SpiderSongType
from base.interfaces.ISong import ISong
from base.utils.Logging.ErrorMessages import LogDebug, LogError, LogExitoso


class SingleVideo(SpiderSongType):
    def __init__(self, url, title, duration, uploader, thumbnail=None):
        self.url = url
        self.title = title
        self.duration = duration
        self.uploader = uploader
        self.thumbnail = None

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

    def UploadFirst(self, queue: list[ISong]):
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