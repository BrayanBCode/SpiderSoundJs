import discord
from discord.ext import commands
from discord import app_commands
from colorama import Fore

from base.classes.SpiderPlayer.player import Player

class remove(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] remove cargado.")

    @app_commands.command(name="remove", description="Reproduce una canción")
    @app_commands.describe(posicion="Posición de la canción a remover.")
    async def remove(self, interaction: discord.Interaction, posicion: int):
        player: Player = self.bot.players.get_player(interaction.guild_id)

        if player:
            if len(player.queue) != 0:
                if posicion > 0 and posicion <= len(player.queue):
                    player.queue.pop(posicion - 1)
                    await interaction.response.send_message(embed=discord.Embed(title=f"Se ha removido la canción en la posición {posicion}.", color=discord.Color.green()))
                    return
                else:
                    await interaction.response.send_message(embed=discord.Embed(title="La posición ingresada no es válida.", color=discord.Color.red()))
                    return
            else:
                await interaction.response.send_message(embed=discord.Embed(title="No hay canciones en la cola.", color=discord.Color.red()))
                return
        else:
            await interaction.response.send_message(embed=discord.Embed(title="No se ha podido remover la canción.", color=discord.Color.red()))
            return

async def setup(bot):
    await bot.add_cog(remove(bot))