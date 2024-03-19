from utils.logic.Video_handlers.MediaHandler import MediaHandler

async def searchModule(ctx, search: str, intance, config) -> list:
    result: list
    for player in config:
        player: MediaHandler
        if not player.check(search):
            continue
        
        return await player.getResult(search, ctx, intance)

            
    