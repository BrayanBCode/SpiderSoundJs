from utils.logic.Video_handlers.YoutubePlaylist import YoutubePlaylist
from utils.logic.Video_handlers.YoutubeSearch import YoutubeSearch
from utils.logic.Video_handlers.YoutubeVideo import YoutubeVideo

def default():
    return [ YoutubePlaylist(), YoutubeVideo(), YoutubeSearch() ] # url_handler.SpotifyPlaylist(), url_handler.SpotifySong(),

def forcePlayConfig():
    return [ YoutubeVideo(), YoutubeSearch() ]
