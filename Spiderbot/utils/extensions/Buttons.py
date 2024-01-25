import discord
from discord import Embed
from typing import Callable, Optional
from pytube import YouTube

class Queue_buttons(discord.ui.View):
    def __init__(self, ctx, get_page: Callable):
        self.ctx = ctx
        self.get_page = get_page
        self.total_pages: Optional[int] = None
        self.index = 1
        super().__init__(timeout=300)

    async def navegate(self):
        emb, self.total_pages = await self.get_page(self.index)
        if self.total_pages == 1:
            await self.ctx.send(embed=emb, view=self)
        elif self.total_pages > 1:
            self.update_buttons()
            await self.ctx.send(embed=emb, view=self)

    async def edit_page(self, ctx):
        emb, self.total_pages = await self.get_page(self.index)
        self.update_buttons()
        await ctx.message.edit(embed=emb, view=self)

    def update_buttons(self):
        self.children[0].disabled = self.index == 1
        self.children[1].disabled = self.index == self.total_pages

    @discord.ui.button(emoji="⏮️", style=discord.ButtonStyle.blurple)
    async def first(self, ctx):
        self.index = 1
        await self.edit_page(ctx)

    @discord.ui.button(emoji="◀️", style=discord.ButtonStyle.blurple)
    async def previous(self, ctx):
        if self.index > 1:  # Asegúrate de que el índice no sea menor que 1
            self.index -= 1
            await self.edit_page(ctx)

    @discord.ui.button(emoji="▶️", style=discord.ButtonStyle.blurple)
    async def next(self, ctx):
        if self.index < self.total_pages:  # Asegúrate de que el índice no exceda el total de páginas
            self.index += 1
            await self.edit_page(ctx)

    @discord.ui.button(emoji="⏭️", style=discord.ButtonStyle.blurple)
    async def end(self, ctx):
        self.index = self.total_pages
        await self.edit_page(ctx)

    async def on_timeout(self):
        # remove buttons on timeout
        message = self.ctx.message
        await message.edit(view=None)

    @staticmethod
    def compute_total_pages(total_results: int, results_per_page: int) -> int:
        return ((total_results - 1) // results_per_page) + 1
