import discord
from discord.utils import Collection

from base.classes.SpiderPlayer.player import Player

class SpiderPlayer():
    def __init__(self, bot):
        self.bot = bot
        self.should_reconnect = True
        # Inicializa correctamente Collection
        self.guilds = {}

    def create_player(self, guild_id: int) -> Player:
        # Crea un nuevo jugador y lo añade a la colección
        new_player = Player(guild_id, self.bot)
        self.guilds[guild_id] = new_player
        return new_player

    def destroy_player(self, guild_id: int) -> None:
        # Elimina un jugador de la colección si existe
        if guild_id in self.guilds:
            del self.guilds[guild_id]

    def get_player(self, guild_id: int) -> Player | None:
        # Obtiene un jugador por su guild_id
        return self.guilds.get(guild_id)
    
    def get_guilds(self) -> dict:
        # Retorna todos los guilds
        return self.guilds