from utils.logic import Structures
from typing import List

lista: List[Structures.MediaPlayer] = [Structures.ytPlaylist(), Structures.SpotifyMusic()]
Mediaplayer: Structures.MediaPlayer

for val in lista:
    if val.check('Youtube'):
        Mediaplayer = val
        break
        


