import discord
from discord.ext import commands
from discord import Color, app_commands
from colorama import Fore

from base.classes.SpiderPlayer.player import Player


class skip(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] skip cargado.")

    @app_commands.command(name="skip", description="Salta una o varias canciones de la cola de reproducción.")
    @app_commands.describe(posicion="Posición de la canción a saltar.")
    async def skip(self, interaction: discord.Interaction, posicion: int | None = 0):
        user_voice_state = interaction.user.voice
        bot_voice_channel = interaction.guild.voice_client.channel if interaction.guild.voice_client else None

        if not user_voice_state or user_voice_state.channel != bot_voice_channel:
            await interaction.response.send_message(embed=discord.Embed(title="Debes estar en el mismo canal de voz que el bot.", color=Color.red()), ephemeral=True)
            return
        
        player: Player = self.bot.players.get_player(interaction.guild_id)

        if posicion == 1:
            posicion = 0

        if player:
            if len(player.queue) != 0:
                if posicion > 0 and posicion <= len(player.queue):
                    player.queue = player.queue[posicion - 1:]
                    await interaction.response.send_message(embed=discord.Embed(title=f"Se han saltado {posicion} canciones.", color=discord.Color.green()))
                    await player.stop()
                    await player.play(interaction)
                    return
                
                elif posicion == 0:
                    await interaction.response.send_message(embed=discord.Embed(title=f"Se salto la cancion", color=discord.Color.green()))
                    await player.stop()
                    await player.play(interaction)
                    return
                
                else:
                    await interaction.response.send_message(embed=discord.Embed(title="La posición ingresada no es válida.", color=discord.Color.red()))
                    return
            else:
                await interaction.response.send_message(embed=discord.Embed(title="No hay canciones en la cola.", color=discord.Color.red()))
                return
        else:
            await interaction.response.send_message(embed=discord.Embed(title="No se ha podido saltar la canción.", color=discord.Color.red()))
            return

async def setup(bot):
    await bot.add_cog(skip(bot))