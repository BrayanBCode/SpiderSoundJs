import discord
from colorama import Fore
from discord import app_commands
from discord.ext import commands

from base.classes.SpiderPlayer.player import Player
from base.utils.Logging.LogMessages import LogExitoso


class leave(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        LogExitoso("[Slash Command] leave cargado.").print()

    @app_commands.command(
        name="leave", description="Hace que el bot se salga del canal de voz."
    )
    async def leave(self, interaction: discord.Interaction):
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
                    color=discord.Color.red(),
                ),
                ephemeral=True,
            )
            return

        player: Player = self.bot.players.getPlayer(interaction.guild_id)

        if player:
            await player.leaveVoiceChannel()
            await interaction.response.send_message(
                embed=discord.Embed(
                    title="Me he salido del canal de voz.", color=discord.Color.green()
                )
            )
            return
        else:
            await interaction.response.send_message(
                embed=discord.Embed(
                    title="No se ha podido salir del canal de voz.",
                    color=discord.Color.red(),
                )
            )
            return


async def setup(bot):
    await bot.add_cog(leave(bot))
