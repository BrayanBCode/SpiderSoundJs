import discord
from discord.ext import commands
import math
from discord.commands.context import ApplicationContext
from utils.logic.Song import SongBasic


class PaginationView(discord.ui.View):
    data : list
    current_page : int = 1
    sep : int = 5

    async def send(self, ctx: ApplicationContext):
        await ctx.followup.send(".", ephemeral=True)
        self.message = await ctx.send(view=self)
        await self.update_message(self.data[:self.sep])

    def create_embed(self, data):
        total_pages = math.ceil(len(self.data) / self.sep)
        embed = discord.Embed(title=f"Cola de reproduccion - Pagina {self.current_page} / {total_pages}", color=0x4b009c)
        for i, item in enumerate(data, start=(self.current_page - 1) * self.sep + 1):
            item : SongBasic
            embed.add_field(name=f"{i}. {item.title}", value=f"{item.artist} - {DurationFormat(item.duration)}", inline=False)
        return embed

    async def update_message(self,data):
        self.update_buttons()
        await self.message.edit(embed=self.create_embed(data), view=self)

    def update_buttons(self):
        total_pages = math.ceil(len(self.data) / self.sep)
        if self.current_page == 1:
            self.first_page_button.disabled = True
            self.prev_button.disabled = True
            self.first_page_button.style = discord.ButtonStyle.gray
            self.prev_button.style = discord.ButtonStyle.gray
        else:
            self.first_page_button.disabled = False
            self.prev_button.disabled = False
            self.first_page_button.style = discord.ButtonStyle.green
            self.prev_button.style = discord.ButtonStyle.primary

        if self.current_page == total_pages:
            self.next_button.disabled = True
            self.last_page_button.disabled = True
            self.last_page_button.style = discord.ButtonStyle.gray
            self.next_button.style = discord.ButtonStyle.gray
        else:
            self.next_button.disabled = False
            self.last_page_button.disabled = False
            self.last_page_button.style = discord.ButtonStyle.green
            self.next_button.style = discord.ButtonStyle.primary

    def get_current_page_data(self):
        from_item = (self.current_page - 1) * self.sep
        until_item = from_item + self.sep
        return self.data[from_item:until_item]

    @discord.ui.button(label="|<", style=discord.ButtonStyle.green)
    async def first_page_button(self, button: discord.ui.Button, interaction: discord.Interaction):
        await interaction.response.defer()
        self.current_page = 1
        await self.update_message(self.get_current_page_data())

    @discord.ui.button(label="<", style=discord.ButtonStyle.primary)
    async def prev_button(self, button: discord.ui.Button, interaction: discord.Interaction):
        await interaction.response.defer()
        self.current_page -= 1
        await self.update_message(self.get_current_page_data())

    @discord.ui.button(label=">", style=discord.ButtonStyle.primary)
    async def next_button(self, button: discord.ui.Button, interaction: discord.Interaction):
        await interaction.response.defer()
        self.current_page += 1
        await self.update_message(self.get_current_page_data())

    @discord.ui.button(label=">|", style=discord.ButtonStyle.green)
    async def last_page_button(self, button: discord.ui.Button, interaction: discord.Interaction):
        await interaction.response.defer()
        self.current_page = math.ceil(len(self.data) / self.sep)
        await self.update_message(self.get_current_page_data())

def DurationFormat(seconds):
    seconds = int(seconds)
    mins, secs = divmod(seconds, 60)
    hours, mins = divmod(mins, 60)
    duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)
    return duration_formatted