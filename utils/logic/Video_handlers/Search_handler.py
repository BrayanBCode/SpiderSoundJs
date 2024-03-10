from utils.logic.Video_handlers.MediaHandler import MediaHandler
from utils.logic.Video_handlers.YoutubePlaylist import YoutubePlaylist
from utils.logic.Video_handlers.YoutubeSearch import YoutubeSearch
from utils.logic.Video_handlers.YoutubeVideo import YoutubeVideo

async def searchModule(search: str, ctx, intance) -> list:
    result: tuple = (False, 'Link invalido')
    mediaplayers = [ YoutubePlaylist(), YoutubeVideo(), YoutubeSearch() ] # url_handler.SpotifyPlaylist(), url_handler.SpotifySong(),
    for player in mediaplayers:
        player: MediaHandler
        if not player.check(search):
            continue
        
        result = await player.getResult(search, ctx, intance)   

    #! Agrega a la base de datos - TOCA CAMBIAR AL TENER LA BD
    intance.Queue.extend(result)
    return result
            
    