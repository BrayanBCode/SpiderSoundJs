import discord
from discord import Embed
from utils.logic.Song import SongData

class PaginationView(discord.ui.View):
    def __init__(self, queue, playing_song, ctx):
        super().__init__()
        self.queue = queue
        self.playing_song = playing_song
        self.ctx = ctx
        self.current_page = 0

    async def get_embed(self):
        offset = self.current_page * 5
        embed = discord.Embed(title='Cola de Reproducción', color=0x120062)
        
        if self.playing_song is not None:
            embed.add_field(name="**Reproduciendo**")
            embed.add_field(name=f"{self.playing_song['title']}", value=f"{self.playing_song['artist']}", inline=True)
            embed.add_field(name=f"Duracion: {self.playing_song['duration']}", value=f"Ver en Youtube")
        
        for index, url in enumerate(self.queue[offset:offset+5], start=offset + 1):
            song = SongData(url)
            embed.add_field(name=f'{index}. {song.title} - {song.artist}', value=f'Duración: {song.duration}\n[Ver en Youtube]({url})', inline=False)
        
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
