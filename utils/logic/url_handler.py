import re
import youtube_dl
import spotipy, os

from utils.logic.Song import SongBasic
from utils.logic import structure
from spotipy.oauth2 import SpotifyClientCredentials

# Declaracion de instancia de la API de Spotify
client_credentials_manager = SpotifyClientCredentials(client_id=os.environ.get("clientID"), client_secret=os.environ.get("clientSecret"))
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

class MediaPlayer():
    def check(self, arg):
        pass
    
    def search(self, arg):
        pass
     
class YoutubeSearch(MediaPlayer):
    
    def check(self, arg):
        # Patrón regex para detectar URLs
        patron_url = re.compile(r'https?://\S+|www\.\S+')

        # Buscar el patrón en la cadena
        coincidencias = patron_url.search(arg)

        # Si se encuentra una coincidencia, es una URL, de lo contrario, es solo texto
        print('YoutubeSearch: ', not bool(coincidencias))
        return not bool(coincidencias)
        
    def search(self, query, num_videos=1):

        ydl_opts = {
            'quiet': True,  # Evita la salida de log
            'skip_download': True,  # Evita descargar los videos
            'playlist_items': '1-25'
        }

        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            try:
                result = ydl.extract_info(f"ytsearch{num_videos}:{query}", download=False)
                if 'entries' in result:
                    songs = result['entries']
                    return [
                        (True, 
                         SongBasic(                            
                                title=song.get('title', 'Canción sin título'),
                                artist=song.get('uploader', 'Artista desconocido'),
                                duration=song.get('duration', 'Duración desconocida'),
                                thumbnail=song.get('thumbnail', 'Sin foto de portada'),
                                id=song.get('id')
                            )
                        ) for song in songs
                    ]
                else:
                    return [(False, "No se encontraron resultados.")]
            except youtube_dl.DownloadError as e:
                return [(False, f"Error al buscar: {str(e)}")]

class YoutubeVideo(MediaPlayer):
    
    def check(self, arg):
        # Patrón de expresión regular para encontrar identificadores de videos de YouTube
        patron_youtube = re.compile(r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})')

        # Buscar coincidencias en la cadena
        coincidencias = patron_youtube.findall(arg)

        # Devolver True si se encontró al menos una coincidencia, de lo contrario, False
        print('YoutubeVideo: ', bool(coincidencias))
        return bool(coincidencias) 
    
    def search(self, video_url):
        
        ydl_opts = {
            'quiet': True,
            'skip_download': True,
            'force_generic_extractor': True,
            'extract_flat': True,
            'format': 'best'
        }

        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            try:
                song = ydl.extract_info(video_url, download=False)
                return [
                    (True, 
                        SongBasic(                            
                            title=song.get('title', 'Canción sin título'),
                            artist=song.get('uploader', 'Artista desconocido'),
                            duration=song.get('duration', 'Duración desconocida'),
                            thumbnail=song.get('thumbnail', 'Sin foto de portada'),
                            id=song.get('id')
                        )
                    )
                ]

            except youtube_dl.DownloadError as e:
                return [(False, f"Error al obtener datos de la canción: {str(e)}")]  
    
class YoutubePlaylist(MediaPlayer):
    def check(self, arg):
        # Patrón regex para buscar un identificador de playlist de YouTube
        patron_playlist = re.compile(r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:playlist(?:s)?)\/|\S*?[?&]list=)|youtu\.be\/)([a-zA-Z0-9_-]+)')

        # Buscar el patrón en la cadena
        coincidencias = patron_playlist.search(arg)

        # Si se encuentra una coincidencia, devolver el identificador, de lo contrario, devolver None
        print('YoutubePlaylist: ', bool(coincidencias))
        return bool(coincidencias)
    
    def search(self, playlist_url):        
        ydl_opts = {
            'quiet': True,  # Evita la salida de log
            'skip_download': True,  # Evita descargar los videos
            'playlist_items': '1-25'
        }


        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            try:
                result = ydl.extract_info(playlist_url, download=False)
                if 'entries' in result:
                    songs = result['entries']
                    
                    return [
                        (True,
                            SongBasic(                            
                                title=song.get('title', 'Canción sin título'),
                                artist=song.get('uploader', 'Artista desconocido'),
                                duration=song.get('duration', 'Duración desconocida'),
                                thumbnail=song.get('thumbnail', 'Sin foto de portada'),
                                id=song.get('id')
                            )
                        ) for song in songs
                    ]
                    
                else:
                    return [(False, "No se encontraron canciones en la playlist.")]
            except youtube_dl.DownloadError as e:
                return [(False, f"Error al obtener enlaces: {str(e)}")]
              
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