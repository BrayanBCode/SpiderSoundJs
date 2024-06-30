from dataclasses import dataclass

@dataclass
class ISongInfo:
    title: str
    duration: float | int
    uploader: str
    webpage_url: str
    thumbnail: str

