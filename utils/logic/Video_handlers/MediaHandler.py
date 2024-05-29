import asyncio
import re
import os
# import spotipy

from utils.logic.Song import SongInfo
from utils.logic import structure


# from spotipy.oauth2 import SpotifyClientCredentials

# Declaracion de instancia de la API de Spotify
# client_credentials_manager = SpotifyClientCredentials(client_id=os.environ.get("clientID"), client_secret=os.environ.get("clientSecret"))
# sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

class MediaHandler:

    def getResult(self, search, ctx, instance):
        return self.search(search, ctx)

    def check(self, arg):
        # Patrón regex para detectar URLs
        patron_url = re.compile(r'https?://\S+|www\.\S+')

        # Buscar el patrón en la cadena
        coincidencias = patron_url.search(arg)

        # Si se encuentra una coincidencia, es una URL, de lo contrario, es solo texto
        print('YoutubeSearch: ', not bool(coincidencias))
        return not bool(coincidencias)

    def search(self, search, ctx):
        pass

    @staticmethod
    def extract(song, ctx):
        
        # with open("output.txt", "w", encoding="utf-8") as file:
        #     file.write(str(song))
        #     print("Se escribio wacho")
        
        defaultImg = "https://salonlfc.com/wp-content/uploads/2018/01/image-not-found-scaled-1150x647.png"

        # Intenta obtener la miniatura directamente desde 'thumbnail'
        thumbnail = song.get('thumbnail', defaultImg)

        # Si no se encuentra en 'thumbnail', intenta obtenerlo desde 'thumbnails'
        if thumbnail is defaultImg:
            thumbnails = song.get('thumbnails', defaultImg)
            if thumbnails:
                thumbnail = thumbnails[0].get('url', 'Sin foto de portada')

        return SongInfo(
            title=song.get('title', 'Canción sin título'),
            artist=song.get('uploader', 'Artista desconocido'),
            duration=song.get('duration', 0),
            thumbnail=thumbnail,
            avatar="ctx.author.avatar",
            author="ctx.author.nick if ctx.author.nick else ctx.author.name",
            webPlayer=song['requested_formats'][1].get('url', 'Not Found') if 'requested_formats' in song else None,
            id=song.get('id')
        )


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
