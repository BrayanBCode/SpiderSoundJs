from abc import ABC, abstractmethod
from youtubesearchpython import VideosSearch
from pytube import Playlist, YouTube
from utils.logic import Structures
import spotipy, os
from spotipy.oauth2 import SpotifyClientCredentials
from typing import List
import re

# Declaracion de instancia de la API de Spotify
client_credentials_manager = SpotifyClientCredentials(client_id=os.environ.get("clientID"), client_secret=os.environ.get("clientSecret"))
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

class MediaPlayer(ABC):
    @abstractmethod
    def check(self, arg):
        pass
    
    @abstractmethod
    def search(self, arg):
        pass
     
class YoutubeSearch(MediaPlayer):
    
    def check(self, arg: str):
        # Patrón regex para detectar URLs
        patron_url = re.compile(r'https?://\S+|www\.\S+')

        # Buscar el patrón en la cadena
        coincidencias = patron_url.search(arg)

        # Si se encuentra una coincidencia, es una URL, de lo contrario, es solo texto
        return not coincidencias
        
    def search(self, arg):        
        # Dar formato de búsqueda
        videos_data = []        
        if isinstance(arg, list):
            for data in arg:
                if isinstance(data, Structures.SpotifyInstance):
                    videos_data.append(f'{data.title} de {data.artist}')
                else:                   
                    print(f"Elemento en la lista no es una instancia válida de SpotifyInstance: {data}")
                    pass
                    
        else:     
            videos_data.append(arg)       
                    
        check = []
        for data in videos_data:
            try:
                searcher = VideosSearch(data, limit=1)
                result = searcher.result()['result'][0]['link']
                check.append((True, result))
            except Exception as e:
                check.append((False, e))
                
        return check
            
class YoutubeVideo(MediaPlayer):
    def check(self, arg: str):
        # Patrón regex para buscar un identificador de YouTube
        patron_youtube = re.compile(r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})')

        # Buscar el patrón en la cadena
        coincidencias = patron_youtube.search(arg)

        # Si se encuentra una coincidencia, devolver el identificador, de lo contrario, devolver None
        return arg 
    
    def search(self, str: str):
        if not isinstance(str, list):
            videos_data = [str]
        else:
            videos_data = str
            
        check = []
        
        for data in videos_data:
            try:
                searcher = VideosSearch(data, limit = 1)
                result = searcher.result()['result'][0]['link']
                check.append((True, result))
            except Exception as e:
                check.append((False, e))
                
        return check           
    
class YoutubePLaylist(MediaPlayer):
    def check(self, arg: str):
        # Patrón regex para buscar un identificador de playlist de YouTube
        patron_playlist = re.compile(r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:playlist(?:s)?)\/|\S*?[?&]list=)|youtu\.be\/)([a-zA-Z0-9_-]+)')

        # Buscar el patrón en la cadena
        coincidencias = patron_playlist.search(arg)

        # Si se encuentra una coincidencia, devolver el identificador, de lo contrario, devolver None
        return coincidencias.group(1) if coincidencias and coincidencias.group(1) else None

class SpotifySong(MediaPlayer):
    def check(self, arg: str):
        return "open.spotify.com/track/" in str
  
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
        Search = Structures.SpotifyInstance(song_name, artist_name)
        
        return YoutubeSearch().search(Search)
      
class SpotifyPlaylist(MediaPlayer):
    def check(self, arg: str):
        return "open.spotify.com/playlist/" in str
    
    def search(self, arg: str):
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
            SearchList.append(Structures.SpotifyInstance(song_name, artist_name))
            
        return YoutubeSearch().search(SearchList)
   