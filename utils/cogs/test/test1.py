from googleapiclient.discovery import build

# API_KEY debe ser tu clave de API de YouTube
API_KEY = ''

def buscar_videos_relacionados(query, max_resultados=10):
    # Realizar una búsqueda de videos relacionados
    youtube = build('youtube', 'v3', developerKey=API_KEY)
    response = youtube.search().list(
        part='snippet',
        q=query,  # Cambiamos 'relatedToVideoId' por 'q'
        type='video',
        maxResults=max_resultados
    ).execute()

    # Obtener los IDs de los videos relacionados
    video_ids = [item['id']['videoId'] for item in response['items']]

    return video_ids

def construir_lista_reproduccion(video_ids):
    # Construir la lista de reproducción
    youtube = build('youtube', 'v3', developerKey=API_KEY)
    playlist_items = [{'snippet': {'resourceId': {'videoId': video_id}, 'position': i}} for i, video_id in enumerate(video_ids)]

    # Crear la lista de reproducción
    playlist = youtube.playlists().insert(
        part='snippet,status',
        body={
            'snippet': {
                'title': 'Lista de Reproducción Similar',
                'description': 'Lista de reproducción generada automáticamente con videos similares.'
            },
            'status': {'privacyStatus': 'public'}
        }
    ).execute()

    # Añadir videos a la lista de reproducción
    for video_id in video_ids:
        youtube.playlistItems().insert(
            part='snippet',
            body={
                'snippet': {
                    'playlistId': playlist['id'],
                    'resourceId': {
                        'kind': 'youtube#video',
                        'videoId': video_id
                    }
                }
            }
        ).execute()

    return playlist['id']

# Ejemplo de uso
cancion_query = 'XsSpBZXW538'  # Cambia esto por la canción que desees
videos_relacionados = buscar_videos_relacionados(cancion_query)
id_lista_reproduccion = construir_lista_reproduccion(videos_relacionados)
print(f'ID de la lista de reproducción: {id_lista_reproduccion}')
