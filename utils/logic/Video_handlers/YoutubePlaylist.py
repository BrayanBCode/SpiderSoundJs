from utils.logic.Video_handlers.MediaHandler import MediaHandler
import re, yt_dlp
    
class YoutubePlaylist(MediaHandler):
    ydl_opts_Playlist = {
        'quiet': False,  # Evita la salida de log
        'skip_download': True,  # Evita descargar los videos
        'playlist_items': '4-25'
    }
    
    ydl_opts_Playlist_limited = {
        'quiet': False,  # Evita la salida de log
        'skip_download': True,  # Evita descargar los videos
        'playlist_items': '1-3'
    }
    
    async def getResult(self, search, ctx, instance):
        added = []
        limitAdded = []

        limitAdded.extend(self.limitSearch(search, ctx))
        instance.Queue.extend(limitAdded)

        await instance.PlaySong(ctx, None)
        
        added.extend(self.search(search, ctx))
        added.extend(limitAdded)
        instance.Queue.extend(added)

        return added

    
    def check(self, arg):
        # Patrón regex para buscar un identificador de playlist de YouTube
        patron_playlist = re.compile(r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:playlist(?:s)?)\/|\S*?[?&]list=)|youtu\.be\/)([a-zA-Z0-9_-]+)')

        # Buscar el patrón en la cadena
        coincidencias = patron_playlist.search(arg)

        # Si se encuentra una coincidencia, devolver el identificador, de lo contrario, devolver None
        print('YoutubePlaylist: ', bool(coincidencias))
        return bool(coincidencias)
    
    def search(self, playlist_url, ctx):
        return self._searchUtil(playlist_url, ctx, self.ydl_opts_Playlist)

    def limitSearch(self, playlist_url, ctx):
        return self._searchUtil(playlist_url, ctx, self.ydl_opts_Playlist_limited)

    def _searchUtil(self, playlist_url, ctx, opt):
        with yt_dlp.YoutubeDL(opt) as ydl:
            try:
                result = ydl.extract_info(playlist_url, download=False)
                songs = result['entries']
                
                return [self.extract(song, ctx) for song in songs]
 
            except yt_dlp.DownloadError as e:
                return []