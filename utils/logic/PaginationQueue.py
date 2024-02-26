import discord
from discord import Embed
from discord.ext import commands
from pytube import YouTube
import os

class PaginationView(discord.ui.View):
    def __init__(self, queue, playing_song, ctx):
        super().__init__()
        self.queue = queue
        self.playing_song = playing_song
        self.ctx = ctx
        self.current_page = 0

    async def get_embed(self):
        offset = self.current_page * 5
        embed = Embed(title=f'Cola de Reprodución', color=0x120062)
        embed.add_field(name=f"Reproduciendo: {self.playing_song["title"]}", value=f"{self.playing_song["author"]}", inline=True)
        embed.add_field(name=f"Duracion: {self.playing_song["duration"]}", value=f"[Ver en Youtube]({self.playing_song["url"]})", inline=True)
        embed.set_thumbnail(url=self.playing_song["thumbnail_url"])
        for index, song in enumerate(self.queue[offset:offset+5], start=offset + 1):
            embed.add_field(name=f'{index}. {song["title"]} - {song["author"]}', value=f'Duración: {song["duration"]}\nVer en Youtube', inline=False)
        n = (len(self.queue) - 1) // 5 + 1
        embed.set_footer(text=f"Pedido por {self.ctx.author} - Pagina {self.current_page + 1} de {n}", icon_url=self.ctx.author.avatar.url)
        return embed

    @discord.ui.button(label='Anterior', style=discord.ButtonStyle.primary)
    async def previous_page(self, button, interaction):
        if self.current_page > 0:
            self.current_page -= 1
            embed = await self.get_embed()
            await interaction.response.edit_message(embed=embed)

    @discord.ui.button(label='Siguiente', style=discord.ButtonStyle.primary)
    async def next_page(self, button, interaction):
        if self.current_page < (len(self.queue) - 1) // 5:
            self.current_page += 1
            embed = await self.get_embed()
            await interaction.response.edit_message(embed=embed)