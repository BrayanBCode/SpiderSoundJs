from dataclasses import dataclass

from discord import FFmpegPCMAudio


@dataclass
class IStreamData:
    URI: str
    thumbnail: str
    ffmpegAudio: FFmpegPCMAudio
