from dataclasses import dataclass

@dataclass
class ISong:
    title: str
    url: str
    duration: float | int | str
    uploader: str

    def __str__(self):
        return f"{self.title} - {self.uploader}"