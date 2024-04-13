from utils.logic.Video_handlers.MediaHandler import MediaHandler
from utils.logic.Video_handlers.YoutubeVideo import YoutubeVideo
import discord
from discord import Embed
from discord.commands.context import ApplicationContext
from discord import Embed
import re
import yt_dlp


class YoutubePlaylist(MediaHandler):
    ydl_opts_Playlist = {
        'quiet': False,  # Evita la salida de log
        'skip_download': True,  # Evita descargar los videos
        'playlist_items': '3-25'
    }

    ydl_opts_Playlist_limited = {
        'quiet': False,  # Evita la salida de log
        'skip_download': True,  # Evita descargar los videos
        'playlist_items': '1-2'
    }

    async def getResult(self, search, ctx: ApplicationContext, instance):
        # await ctx.send(embed=Embed(title="Las Playlist estan deshabilitadas temporalmente."))
        # return []

        added = []
        limitAdded = []

        limitAdded.extend(self.limitSearch(search, ctx))
        instance.Queue.extend(limitAdded)

        print("getResult antes de Playsong:", instance.Queue)
        await instance.PlaySong(ctx, None)
        print("getResult despues de Playsong:", instance.Queue)
        added.extend(self.search(search, ctx)[2:])
        added.extend(limitAdded)

        print("getResult:", added)
        return added

    def check(self, arg):
        # Patrón regex para buscar un identificador de playlist de YouTube
        patron_playlist = re.compile(
            r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:playlist(?:s)?)\/|\S*?[?&]list=)|youtu\.be\/)([a-zA-Z0-9_-]+)')

        # Buscar el patrón en la cadena
        coincidencias = patron_playlist.search(arg)

        # Sí se encuentra una coincidencia, devolver el identificador, de lo contrario, devolver None
        print('YoutubePlaylist: ', bool(coincidencias))
        return bool(coincidencias)

    def search(self, playlist_url, ctx):
        return self._searchUtil(playlist_url, ctx, self.ydl_opts_Playlist)

    def limitSearch(self, playlist_url, ctx):
        return self._searchUtil(playlist_url, ctx, self.ydl_opts_Playlist_limited)

    def _searchUtil(self, playlist_url, ctx, opt):
        with yt_dlp.YoutubeDL(opt) as ydl:
            try:
                info_dict = ydl.extract_info(playlist_url, download=False)
                songs = info_dict['entries']

                return [self.extract(song, ctx) for song in songs]

            except yt_dlp.DownloadError as e:
                return []