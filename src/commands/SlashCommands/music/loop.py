import discord
from colorama import Fore
from discord import Color, app_commands
from discord.ext import commands

from base.classes.SpiderPlayer.player import Player
from base.utils.Logging.LogMessages import LogExitoso


class loop(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        LogExitoso("[Slash Command] loop cargado.").print()

    @app_commands.command(
        name="loop",
        description="Activa o desactiva el bucle de la cola de reproducción.",
    )
    async def loop(self, interaction: discord.Interaction):
        user_voice_state = interaction.user.voice
        bot_voice_channel = (
            interaction.guild.voice_client.channel
            if interaction.guild.voice_client
            else None
        )

        if not user_voice_state or user_voice_state.channel != bot_voice_channel:
            await interaction.response.send_message(
                embed=discord.Embed(
                    title="Debes estar en el mismo canal de voz que el bot.",
                    color=Color.red(),
                ),
                ephemeral=True,
            )
            return

        player: Player = self.bot.players.getPlayer(interaction.guild_id)

        if player:
            player.loop = not player.loop
            await interaction.response.send_message(
                embed=discord.Embed(
                    title=f"Loop {'activado' if player.loop else 'desactivado'}",
                    color=discord.Color.green(),
                )
            )
            return
        else:
            await interaction.response.send_message(
                embed=discord.Embed(
                    title="No se ha podido activar el loop.", color=discord.Color.red()
                )
            )
            return


async def setup(bot):
    await bot.add_cog(loop(bot))
