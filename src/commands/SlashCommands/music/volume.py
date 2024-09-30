import discord
from colorama import Fore
from discord import Color, app_commands
from discord.ext import commands

from base.classes.SpiderPlayer.player import Player
from base.utils.Logging.LogMessages import LogExitoso


class volume(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        LogExitoso("[Slash Command] volume cargado.").print()

    @app_commands.command(name="volume", description="Cambia el volumen actual.")
    @app_commands.describe(vol="Volumen a cambiar. (0-100)")
    async def volume(self, interaction: discord.Interaction, vol: int):
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

        if vol < 0 or vol > 100:
            await interaction.response.send_message(
                embed=discord.Embed(
                    title="El volumen debe ser un número entre 0 y 100.",
                    color=discord.Color.red(),
                )
            )
            return

        if player:
            player.volume = vol

            player.guild.setMusicSetting("volume", vol)
            player.guild.update()

            if player.VoiceClient.is_playing():

                player.VoiceClient.source.volume = vol / 100

            await interaction.response.send_message(
                embed=discord.Embed(
                    title=f"Volumen cambiado a `{vol}`", color=discord.Color.green()
                )
            )
            return

        else:
            await interaction.response.send_message(
                embed=discord.Embed(
                    title="No se ha podido cambiar el volumen.",
                    color=discord.Color.red(),
                )
            )
            return


async def setup(bot):
    await bot.add_cog(volume(bot))
