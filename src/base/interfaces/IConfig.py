from dataclasses import dataclass

@dataclass
class IConfig:
    token: str
    clientID: int
    devGuildID: int