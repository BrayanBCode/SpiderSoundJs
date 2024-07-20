from dataclasses import dataclass
from base.interfaces.ISong import ISong

@dataclass
class IPlayList:
    title: str
    url: str
    uploader: str
    entries: list[ISong]
    removed: list[ISong]