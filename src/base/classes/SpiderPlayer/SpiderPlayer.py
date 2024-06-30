import discord
from discord.utils import Collection

from base.classes.SpiderPlayer.player import player

class SpiderPlayer():
    def __init__(self, bot):
        self.bot = bot
        # Inicializa correctamente Collection
        self.guilds = {}

    def create_player(self, guild_id: int) -> player:
        # Crea un nuevo jugador y lo añade a la colección
        new_player = player(guild_id, self.bot)
        self.guilds[guild_id] = new_player
        return new_player

    def destroy_player(self, guild_id: int):
        # Elimina un jugador de la colección si existe
        if guild_id in self.guilds:
            del self.guilds[guild_id]

    def get_player(self, guild_id: int):
        # Obtiene un jugador por su guild_id
        return self.guilds.get(guild_id)
    
    def get_guilds(self):
        # Retorna todos los guilds
        return self.guilds