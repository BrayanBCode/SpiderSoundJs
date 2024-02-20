from pytube import Playlist, YouTube

playlist_url = 'https://www.youtube.com/watch?v=ZGXOWPZ64DA&list=PLIEwNprRo-5IKua6jG19-HbFsa9lNgGxX'
playlist = Playlist(playlist_url)
video_urls = list(playlist.video_urls)

for url in video_urls:
    print(YouTube(url).title)