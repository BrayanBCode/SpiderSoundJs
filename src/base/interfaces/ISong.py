from dataclasses import dataclass

@dataclass
class ISong:
    title: str
    url: str
    duration: float | int | str
    uploader: str

# 126