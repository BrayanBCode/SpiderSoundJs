import discord
from discord.ext import commands
from typing import Callable, Optional

class Queue_buttons(discord.ui.View):
    def __init__(self, ctx: commands.Context, get_page: Callable):
        super().__init__(timeout=100)
        self.ctx = ctx
        self.get_page = get_page
        self.total_pages: Optional[int] = None
        self.index = 1

    async def interaction_check(self, interaction: discord.Interaction) -> bool:
        return interaction.user == self.ctx.author

    async def navegate(self):
        emb, self.total_pages = await self.get_page(self.index)
        if self.total_pages == 1:
            await self.ctx.send(embed=emb)
        elif self.total_pages > 1:
            self.update_buttons()
            await self.ctx.send(embed=emb, view=self)

    async def edit_page(self, ctx: commands.Context):
        emb, self.total_pages = await self.get_page(self.index)
        self.update_buttons()
        await ctx.message.edit(embed=emb, view=self)

    def update_buttons(self):
        if self.index > self.total_pages // 2:
            self.children[2].emoji = "⏮️"
        else:
            self.children[2].emoji = "⏭️"
        self.children[0].disabled = self.index == 1
        self.children[1].disabled = self.index == self.total_pages

    @discord.ui.button(emoji="◀️", style=discord.ButtonStyle.blurple)
    async def previous(self, interaction: discord.Interaction, button: discord.Button):
        self.index -= 1
        await self.edit_page(interaction)
        await interaction.response.defer()

    @discord.ui.button(emoji="▶️", style=discord.ButtonStyle.blurple)
    async def next(self, interaction: discord.Interaction, button: discord.Button):
        self.index += 1
        await self.edit_page(interaction)
        await interaction.response.defer()

    @discord.ui.button(emoji="⏭️", style=discord.ButtonStyle.blurple)
    async def end(self, interaction: discord.Interaction, button: discord.Button):
        if self.index <= self.total_pages//2:
            self.index = self.total_pages
        else:
            self.index = 1
        await self.edit_page(interaction)
        await interaction.response.defer()

    async def on_timeout(self):
        # eliminar los botones cuando se agote el tiempo
        if self.ctx.message.author == self.ctx.bot.user:
            await self.ctx.message.edit(view=None)

    @staticmethod
    def compute_total_pages(total_results: int, results_per_page: int) -> int:
        return ((total_results - 1) // results_per_page) + 1
    
class Player_buttons(discord.ui.View):
    def __init__(self, ctx, music_ext_instance):
        self.ctx = ctx
        self.music_ext_instance = music_ext_instance
        super().__init__()

    @discord.ui.button(emoji='⏹️', style=discord.ButtonStyle.blurple, custom_id="stop_button")
    async def stop_button_callback(self, button: discord.ui.Button, interaction: discord.Interaction):
        vc = self.ctx.guild.voice_client
        vc.stop()
        await interaction.response.defer()


    @discord.ui.button(emoji='⏯️', style=discord.ButtonStyle.blurple, custom_id="pauseResume_button")
    async def pause_button_callback(self, button: discord.ui.Button, interaction: discord.Interaction):
        vc = self.ctx.guild.voice_client
        if vc.is_playing() or vc.is_paused():
            vc.pause()
        else:
            vc.resume()
        await interaction.response.defer()

    @discord.ui.button(emoji='⏭️', style=discord.ButtonStyle.blurple, custom_id="skip_button")
    async def skip_button_callback(self, button: discord.ui.Button, interaction: discord.Interaction):
        vc = self.ctx.guild.voice_client
        vc.stop()
        vc.pause()
        await interaction.response.defer()


        
