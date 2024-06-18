from dataclasses import dataclass

@dataclass
class IVideo_Info:
    title: str
    duration: float | int
    uploader: str
    webpage_url: str
    thumbnail: str

