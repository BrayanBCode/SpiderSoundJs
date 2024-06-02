from src.utils.music_control.Video_handlers.MediaHandler import MediaHandler


def searchModule(ctx, search: str, instance, config) -> list:
    result: list
    for player in config:
        player: MediaHandler
        if not player.check(search):
            continue

        return player.getResult(search, ctx, instance)
    