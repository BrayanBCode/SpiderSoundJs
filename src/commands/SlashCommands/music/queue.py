import discord
from colorama import Fore
from discord import app_commands
from discord.ext import commands

from base.classes.Bot import CustomBot
from base.utils.colors import Colours
from base.utils.Logging.LogMessages import LogExitoso
from base.utils.simpleTools import simpleTools
from components import button_paginator as pg


class queue(commands.Cog):
    def __init__(self, bot: CustomBot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        LogExitoso("[Slash Command] queue cargado.").print()

    @app_commands.command(name="queue", description="Muestra las canciones en la cola.")
    async def queue(self, interaction: discord.Interaction):
        player = self.bot.players.getPlayer(interaction.guild_id)

        if player:
            if len(player.queue) == 0:
                await interaction.response.send_message(
                    embed=discord.Embed(
                        title="No hay canciones en la cola.", color=discord.Color.red()
                    ),
                    ephemeral=True,
                )
                return

            pages = []

            max_pages = 6

            for i in range(0, len(player.queue), max_pages):
                embed = discord.Embed(
                    title="Lista de reproducción", color=Colours.default()
                )
                embed.set_footer(
                    text=f"por {interaction.user.display_name} - {len(player.queue)} canciones",
                    icon_url=interaction.user.avatar.url,
                )
                embed.timestamp = interaction.created_at

                for index, song in enumerate(
                    player.queue[i : i + max_pages], start=i + 1
                ):
                    embed.add_field(
                        name=f"{index}. {song.title}",
                        value=f"Duración: {simpleTools.formatTime(song.duration)}",
                        inline=False,
                    )

                pages.append(embed)

            pag = pg.Paginator(self.bot, pages, interaction)

            pag.add_button("first", emoji="⏮️", style=discord.ButtonStyle.blurple)
            pag.add_button("prev", emoji="⏪", style=discord.ButtonStyle.blurple)
            pag.add_button("goto")
            pag.add_button("next", emoji="⏩", style=discord.ButtonStyle.blurple)
            pag.add_button("last", emoji="⏭️", style=discord.ButtonStyle.blurple)
            await pag.start()
            return

        await interaction.response.send_message(
            embed=discord.Embed(
                title="No hay canciones en la cola.", color=discord.Color.red()
            )
        )


async def setup(bot):
    await bot.add_cog(queue(bot))
