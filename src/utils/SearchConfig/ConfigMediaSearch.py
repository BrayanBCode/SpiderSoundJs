from src.utils.music_control.Video_handlers.YoutubePlaylist import YoutubePlaylist
from src.utils.music_control.Video_handlers.YoutubeSearch import YoutubeSearch
from src.utils.music_control.Video_handlers.YoutubeVideo import YoutubeVideo


def default():
    return [YoutubePlaylist(), YoutubeVideo(),
            YoutubeSearch()]  # url_handler.SpotifyPlaylist(), url_handler.SpotifySong(),


def forcePlayConfig():
    return [YoutubeVideo(), YoutubeSearch()]
