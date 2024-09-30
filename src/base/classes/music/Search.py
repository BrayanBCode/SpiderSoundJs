from discord import Interaction

from base.classes.music.SongTypes import SpiderSongType
from base.classes.music.Video import SingleVideo
from base.utils.Logging.LogMessages import LogDebug, LogError, LogExitoso


class SearchVideos(SpiderSongType):
    """
    Clase base para las busquedas de videos.
    """

    search: str
    entries: list[SingleVideo]

    def __init__(self, search, entries):
        self.search = search
        self.entries = entries

    async def send(self, interaction: Interaction):
        try:
            logger = LogExitoso(
                title=f"Busqueda - {self.search}.",
                message=f"Se agrego ``{self.entries[0].title}`` a la cola",
            )

            logger.print()
            await logger.send(interaction)
        except Exception as e:
            LogError(
                title=f"Error al enviar la busqueda **{self.search}**.",
                message=f"Error: {e}",
            ).log(e)

    def UploadDefault(self, queue):
        try:
            queue.append(self.entries[0])
            LogDebug(
                title=f"Busqueda **{self.entries[0].title}** agregado.",
                message=f"Duración: {self.entries[0].duration}",
            ).print()
        except Exception as e:
            LogError(
                title=f"Error al enviar la busqueda **{self.search}**.",
                message=f"Error: {e}",
            ).log(e)

    def UploadFirst(self, queue):
        try:
            queue.insert(0, self.entries[0])
            LogDebug(
                title=f"Busqueda **{self.entries[0].title}** agregado.",
                message=f"Duración: {self.entries[0].duration}",
            ).print()
        except Exception as e:
            LogError(
                title=f"Error al subir el video **{self.entries[0].title}**.",
                message=f"Error: {e}",
            ).log(e)
