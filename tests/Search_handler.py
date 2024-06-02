from utils.Video_handlers.MediaHandler import MediaHandler


def searchModule(ctx, search: str, config, instance = None) -> list:
    result: list
    for player in config:
        player: MediaHandler
        if not player.check(search):
            continue

        return player.getResult(search, ctx, instance)
    