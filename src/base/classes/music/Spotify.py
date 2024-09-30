from discord import Interaction

from base.classes.music.SongTypes import SpiderSongType
from base.utils.Logging.LogMessages import LogError


class Spotify(SpiderSongType):
    def __init__(self):
        super().__init__()

    async def send(self, interaction: Interaction):
        try:
            await LogError(
                title=f"Spotify esta deshabilitado.",
                message=f"Los links de Spotify no son compatibles por el momento.",
            ).send(interaction)
        except Exception as e:
            LogError(
                title=f"Error al enviar el mensaje **{self.title}**.",
                message=f"Error: {e}",
            ).log(e)
