from dataclasses import dataclass

@dataclass
class IHelpCommand:
    name: str
    description: str
    slash_command: bool = False
    prefix_command: bool = False