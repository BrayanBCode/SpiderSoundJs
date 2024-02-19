import discord
from discord import Embed
class Comand():
    def __init__(self, title, description) -> None:
        self.title = title
        self.description = description
        
    def save(self, embed: Embed):
        embed.add_field(name=self.title, value=self.description, inline=False)
