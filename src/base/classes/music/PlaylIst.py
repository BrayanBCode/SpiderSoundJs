import discord
from base.classes.music.SongTypes import SpiderSongType
from base.interfaces.ISong import ISong
from base.utils.Logging.ErrorMessages import LogExitoso


class Playlist(SpiderSongType):
    """
    Clase base para las listas de reproducción.
    """

    title: str
    uploader: str
    url: str
    entries: list[ISong]
    removed: list[ISong]

    def __init__(self, title, uploader, url, entries, removed = []):
        title = title
        uploader = uploader
        url =  url
        entries = entries
        removed = removed

    def start(self):
        self.upload()
        self.send()

    async def send(self, interaction: discord.Interaction):
        await LogExitoso(title="pepe", message="pepe").send(interaction)

    def extract(self):
        return self.entries

    def identify(self):
        return self.__class__.__name__