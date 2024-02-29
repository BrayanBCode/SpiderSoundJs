from utils.logic import url_handler

def searchModule(search: str) -> list:
    result: tuple = (False, 'Link invalido')
    mediaplayers = [ url_handler.YoutubePlaylist(), url_handler.YoutubeVideo(), url_handler.SpotifyPlaylist(), url_handler.SpotifySong(), url_handler.YoutubeSearch() ]
    for player in mediaplayers:
        if player.check(search):
            return player.search(search)
            
    