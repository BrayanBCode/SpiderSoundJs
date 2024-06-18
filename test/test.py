from googleapiclient.discovery import build

def youtube_search(query, max_results=10):
    youtube = build('youtube', 'v3', developerKey='AIzaSyCf4qHNcwgJjOBYN0SGiikTmpMF5gBHcEs')

    # Realiza la búsqueda
    search_response = youtube.search().list(
        q=query,
        part='id,snippet',
        maxResults=max_results
    ).execute()

    videos = []

    # Itera sobre los resultados y recopila los detalles
    for search_result in search_response.get('items', []):
        if search_result['id']['kind'] == 'youtube#video':
            videos.append({
                'title': search_result['snippet']['title'],
            })

    return videos

# Ejemplo de uso
videos = youtube_search('Despacito')
for video in videos:
    print(f"Title: {video['title']}")