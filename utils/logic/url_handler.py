import re
import yt_dlp
import spotipy, os, asyncio

from utils.logic.Song import SongBasic
from utils.logic import structure
from spotipy.oauth2 import SpotifyClientCredentials

# Declaracion de instancia de la API de Spotify
client_credentials_manager = SpotifyClientCredentials(client_id=os.environ.get("clientID"), client_secret=os.environ.get("clientSecret"))
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

class MediaPlayer():

    async def getResult(self, search, ctx, instance):
        return self.search(search, ctx)

    def check(self, arg):
        # Patrón regex para detectar URLs
        patron_url = re.compile(r'https?://\S+|www\.\S+')

        # Buscar el patrón en la cadena
        coincidencias = patron_url.search(arg)

        # Si se encuentra una coincidencia, es una URL, de lo contrario, es solo texto
        print('YoutubeSearch: ', not bool(coincidencias))
        return not bool(coincidencias)
    
    def search():
        pass

    def extract(self, song, ctx):
        defaultImg = "https://salonlfc.com/wp-content/uploads/2018/01/image-not-found-scaled-1150x647.png"
        
        # Intenta obtener la miniatura directamente desde 'thumbnail'
        thumbnail = song.get('thumbnail', defaultImg)

        # Si no se encuentra en 'thumbnail', intenta obtenerlo desde 'thumbnails'
        if thumbnail is defaultImg:
            thumbnails = song.get('thumbnails', [])
            if thumbnails:
                thumbnail = thumbnails[0].get('url', 'Sin foto de portada')

        return SongBasic(
            title=song.get('title', 'Canción sin título'),
            artist=song.get('uploader', 'Artista desconocido'),
            duration=song.get('duration', 'Duración desconocida'),
            thumbnail=thumbnail,
            avatar=ctx.author.avatar,
            author=ctx.author.nick if ctx.author.nick else ctx.author.name,
            id=song.get('id')
        )
     
class YoutubeSearch(MediaPlayer):
    ydl_opts_Search = {
        'quiet': True,  # Evita la salida de log
        'format': 'best',  # Elige el mejor formato disponible
        'extract_flat': True,  # Extrae solo la información básica
    }      
    
    def search(self, query, ctx, num_videos=1):
        with yt_dlp.YoutubeDL(self.ydl_opts_Search) as ydl:
            try:
                result = ydl.extract_info(f"ytsearch{num_videos}:{query}", download=False)
                songs = result['entries']
                print(songs)
                
                return [self.extract(song, ctx) for song in songs]
 
            except yt_dlp.DownloadError as e:
                return None
    
class YoutubeVideo(MediaPlayer):
    ydl_opts_Video = {
        'quiet': False,
        'skip_download': True,
        'force_generic_extractor': True,
        'extract_flat': True,
        'format': 'best'
    }
    
    def check(self, arg):
        # Patrón de expresión regular para encontrar identificadores de videos de YouTube
        patron_youtube = re.compile(r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})')

        # Buscar coincidencias en la cadena
        coincidencias = patron_youtube.findall(arg)

        # Devolver True si se encontró al menos una coincidencia, de lo contrario, False
        print('YoutubeVideo: ', bool(coincidencias))
        return bool(coincidencias) 
    
    def search(self, video_url, ctx):
        with yt_dlp.YoutubeDL(self.ydl_opts_Video) as ydl:
            try:
                result = ydl.extract_info(video_url, download=False)
                return [self.extract(result, ctx)]
            
            except yt_dlp.DownloadError as e:
                return None
            
class YoutubePlaylist(MediaPlayer):
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
        limitResult = self.limitSearch(search, ctx)
        for data in limitResult:
            if isinstance(data, SongBasic):
                instance.Queue.append(data)
            
        await instance.PlaySong(ctx, None)
                        
        return self.search(search, ctx)

    
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
                return None

"""          
class SpotifySong(MediaPlayer):
    def check(self, arg):
        print('SpotifySong: ',"open.spotify.com/track/" in arg)
        return "open.spotify.com/track/" in arg
  
    def search(self, arg: str):
        # Extraer el ID de la canción desde la URL
        track_id = arg.split('/')[-1].split('?')[0]

        # Obtener información de la canción
        track_info = sp.track(track_id)

        # Obtener el nombre de la canción y el nombre del artista
        song_name = track_info['name']
        
        # Tomando solo el primer artista de la lista
        artist_name = track_info['artists'][0]['name']
        
        # Formato de busqueda para YT
        Search = structure.SpotifyInstance(song_name, artist_name)
        
        return YoutubeSearch().search(Search)
      
class SpotifyPlaylist(MediaPlayer):    
    def check(self, arg):        
        return "open.spotify.com/playlist/" in arg
    
    def search(self, arg):
        # Extraer el ID de la lista de reproducción desde la URL
        playlist_id = arg.split('/')[-1].split('?')[0]

        # Obtener información de la lista de reproducción
        playlist_info = sp.playlist(playlist_id)

        # Crear una lista para almacenar los diccionarios de canciones
        SearchList = []

        # Iterar sobre las pistas de la lista de reproducción y guardar información en la lista spotify_list
        for track in playlist_info['tracks']['items']:
            song_name = track['track']['name']
            artist_name = track['track']['artists'][0]['name']
            SearchList.append(structure.SpotifyInstance(song_name, artist_name))
            
        return YoutubeSearch().search(SearchList)
"""