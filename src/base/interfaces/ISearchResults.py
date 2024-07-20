from dataclasses import dataclass

from base.interfaces.ISong import ISong

@dataclass
class ISearchResults:
    search: str
    results: list[ISong]