import re

import yt_dlp
from colorama import Fore
from discord import FFmpegPCMAudio

from base.classes.music.PlaylIst import Playlist
from base.classes.music.Search import SearchVideos
from base.classes.music.Spotify import Spotify
from base.classes.music.Video import SingleVideo
from base.interfaces.IStreamData import IStreamData
from base.utils.Logging.LogMessages import LogDebug, LogError


class Youtube:
    async def get_audio_stream(self, video: SingleVideo) -> IStreamData:
        ydl_opts = {
            "format": "bestaudio",
            "quiet": True,
            "no_warnings": True,
            "default_search": "auto",
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video.url, download=False)
            audio_url = info["url"]
            thumbnail = info["thumbnail"]
            ffmpg = {
                "before_options": "-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5",
                "options": "-vn",
            }
            ffmpg_audio = FFmpegPCMAudio(audio_url, **ffmpg)

        return IStreamData(URI=audio_url, thumbnail=thumbnail, ffmpegAudio=ffmpg_audio)

    async def getVideoInfo(self, url) -> SingleVideo | None:
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "default_search": "auto",
            "extract_flat": True,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                return SingleVideo(
                    title=self.cleanTitle(info.get("title")),
                    url=f"https://www.youtube.com/watch?v={info.get('id')}",
                    duration=info.get("duration"),
                    uploader=info.get("uploader"),
                )
        except Exception as e:
            print(
                f"{Fore.RED}[ERROR] Error al obtener la información del video {url}.\n {e}"
            )
            return None

    # Arreglar el manejo de errores - si hay error se debe retornar None
    async def getSearch(self, query: str) -> SearchVideos | None:
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "default_search": "auto",
            "extract_flat": True,  # Importante para playlists, evita descargar los videos.
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                result = ydl.extract_info(f"ytsearch1:{query}", download=False)

                search = SearchVideos(
                    search=query,
                    entries=[
                        SingleVideo(
                            title=self.cleanTitle(video.get("title", "private")),
                            url=f"https://www.youtube.com/watch?v={video.get('id')}",
                            duration=video.get("duration", 0),
                            uploader=video.get("uploader", "Desconocido"),
                        )
                        for video in result["entries"]
                        if video.get("title") and video.get("title") != "private"
                    ],
                )

                return search

            except Exception as e:
                print(f"{Fore.RED}[ERROR] Error al buscar la canción {query}.\n {e}")
                return None

    async def getPlaylistInfo(self, url) -> Playlist:
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "default_search": "auto",
            "extract_flat": True,  # Importante para playlists, evita descargar los videos.
            "playlistend": 100,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                info = ydl.extract_info(url, download=False)

                if "entries" not in info:
                    return await self.getPlaylistInfo(info["url"])

                videos = []
                removed = []
                for video in info["entries"]:
                    duration = video.get("duration", 0)
                    if duration is None:
                        song = SingleVideo(
                            title=video.get("title"),
                            url=f"https://www.youtube.com/watch?v={video.get('id')}",
                            duration=0,
                            uploader="Desconocido",
                        )
                        LogDebug(
                            f"{Fore.YELLOW} Descartado: {song}"
                        )  # Impresión de depuración para videos descartados
                        removed.append(song)
                        continue

                    videos.append(
                        SingleVideo(
                            title=self.cleanTitle(video.get("title")),
                            url=f"https://www.youtube.com/watch?v={video.get('id')}",
                            duration=video.get("duration", 0),
                            uploader=video.get("uploader", "desconocido"),
                        )
                    )

                return Playlist(
                    title=self.cleanTitle(info.get("title", "private")),
                    url=info.get("original_url"),
                    uploader=info.get("uploader", "Desconocido"),
                    entries=videos,
                    removed=removed,
                )
            except Exception as e:
                logger = LogError(
                    title=f"Error al obtener la información de la playlist {url}.",
                    message=f"Error: {e}",
                )

                logger.print()
                logger.log(e)

    # deprecated
    # async def searchRelatedSong(self, lastVideo: str):
    #     try:
    #         # Ejecutar el comando yt-dlp para obtener videos relacionados
    #         result = subprocess.run(['yt-dlp', '--get-related', '--dump-json', lastVideo], capture_output=True, text=True)

    #         # Parsear el resultado JSON
    #         relatedVideos = json.loads(result.stdout)

    #         if relatedVideos:
    #             vid = SingleVideo(
    #                 title=self.cleanTitle(relatedVideos[0].get('title')),
    #                 url=f"https://www.youtube.com/watch?v={relatedVideos[0].get('id')}",
    #                 duration=relatedVideos[0].get('duration'),
    #                 uploader=relatedVideos[0].get('uploader')
    #             )
    #             print(vid.title)
    #             return vid
    #         raise Exception("No se encontró un video relacionado.")

    #     except Exception as e:
    #         LogError(
    #             title="Error al buscar la canción relacionada.",
    #             message=f"Error: {e}",
    #         ).log(e)

    async def Search(self, url: str):
        if "youtube.com/playlist" in url or "list=PL" in url or "index=" in url:
            return await self.getPlaylistInfo(url)
        elif "start_radio=" in url:
            return await self.getPlaylistInfo(url)
        elif "youtube.com/watch" in url or "youtu.be" in url:
            return await self.getVideoInfo(url)
        elif "open.spotify.com" in url:
            return Spotify()
        else:
            return await self.getSearch(url)

    @staticmethod
    def cleanTitle(titulo):
        # Eliminar las etiquetas entre corchetes
        titulo = re.sub(r"\[.*?\]", "", titulo)
        # Eliminar las etiquetas entre paréntesis
        titulo = re.sub(r"\(.*?\)", "", titulo)
        # Eliminar las etiquetas entre llaves
        titulo = re.sub(r"\{.*?\}", "", titulo)
        # Eliminar los caracteres especiales
        titulo = re.sub(r"[^\w\s]", "", titulo)
        # Eliminar los espacios adicionales
        titulo = re.sub(r"\s+", " ", titulo).strip()
        return titulo
