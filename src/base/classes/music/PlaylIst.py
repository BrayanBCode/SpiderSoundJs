import traceback
from discord import Interaction
from base.classes.music.SongTypes import SpiderSongType
from base.classes.music.Video import SingleVideo
from base.interfaces.ISong import ISong
from base.utils.Logging.ErrorMessages import LogAviso, LogDebug, LogError, LogExitoso


class Playlist(SpiderSongType):
    """
    Clase base para las listas de reproducción.
    """

    title: str
    uploader: str
    url: str
    entries: list[SingleVideo]
    removed: list[ISong]

    def __init__(self, title, uploader, url, entries, removed = []):
        self.title = title
        self.uploader = uploader
        self.url =  url
        self.entries = entries
        self.removed = removed

    async def send(self, interaction: Interaction):
        """
        Envía la lista de reproducción agregada al canal.
        """

        try:
            ValidSongslogger = LogExitoso(
                title=f"Lista de reproducción - **{self.title}** agregada.",
                message=f"Se han agregado ``{len(self.entries)}`` canciones.",
            )

            ValidSongslogger.print()
            await ValidSongslogger.send(interaction)

            if len(self.removed) > 0:
                InValidSongslogger = LogAviso(
                    title=f"Canciones removidas",
                    message=f"Se removieron ``{len(self.removed)}`` canciones por no estar disponibles.",
                )

                InValidSongslogger.print()
                await InValidSongslogger.send(interaction)
        except Exception as e:
            LogError(
                title=f"Error al enviar la lista de reproducción **{self.title}**.",
                message=f"Error: {e}",
            ).log(e)

    def UploadDefault(self, queue: list[ISong]):
        """
        Sube la lista de reproducción a la cola de reproducción.
        """
        try:
            queue.extend(self.entries)
            LogDebug(
                title=f"Lista de reproducción **{self.title}** agregada.",
                message=f"Se han agregado ``{len(self.entries)}`` canciones.",
            ).print()
        except Exception as e:
            LogError(
                title=f"Error al subir la lista de reproducción **{self.title}**.",
                message=f"Error: {e}",
            ).log(e)

    def UploadFirst(self, queue: list[ISong]):
        """
        Sube la lista de reproducción a la base de datos.
        """
        try:
            queue.insert(0, self.entries)
            LogDebug(
                title=f"Lista de reproducción **{self.title}** agregada.",
                message=f"Se han agregado ``{len(self.entries)}`` canciones por delante de la cola.",
            ).print()
        except Exception as e:
            LogError(
                title=f"Error al subir la lista de reproducción **{self.title}**.",
                message=f"Error: {e}",
            ).log(e)

    

    