from pytube import Playlist, YouTube

url = "https://www.youtube.com/watch?v=jJJlV0z89rU&list=RDMM&start_radio=1&rv=mo7MpQZRd5Q"

if 'list=' in url.lower():
    playlist = Playlist(url)
    for video_url in playlist.video_urls:
        try:
            video = YouTube(video_url)
            print(f"Título: {video.title}")
            print(f"URL: {video_url}\n")
        except Exception as e:
            print(f"Se produjo un error: {str(e)}")
