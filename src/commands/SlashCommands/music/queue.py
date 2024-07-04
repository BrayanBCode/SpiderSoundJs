import discord
import button_paginator as pg 

from discord.ext import commands
from discord import app_commands
from colorama import Fore

from base.classes.Bot import CustomBot
from base.utils.colors import Colours

class queue(commands.Cog):
    def __init__(self, bot: CustomBot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print(f"{Fore.GREEN}[Slash Command] queue cargado.")

    @app_commands.command(name="queue", description="Muestra las canciones en la cola.")
    async def queue(self, interaction: discord.Interaction):
        player = self.bot.players.get_player(interaction.guild_id)
    
        if player:
            if len(player.queue) == 0:
                await interaction.response.send_message(embed=discord.Embed(title="No hay canciones en la cola.", color=discord.Color.red()))
                return
    
            pages = []
            for i in range(0, len(player.queue), 7):
                embed = discord.Embed(title="Canciones en la cola", color=Colours.default())
                embed.set_footer(text=f"Pedido por {interaction.user.display_name}", icon_url=interaction.user.avatar.url)
                embed.timestamp = interaction.created_at

                for index, song in enumerate(player.queue[i:i+7], start=i+1):
                    hours, remainder = divmod(song.duration, 3600)
                    minutes, seconds = divmod(remainder, 60)
                    
                    duration_str = f"{hours:02}:{minutes:02}:{seconds:02}" if hours else f"{minutes:02}:{seconds:02}"
    
                    embed.add_field(name=f"{index}. {song.title}", value=f"Duración: {duration_str}", inline=False)
                pages.append(embed)
    
            pag = pg.Paginator(self.bot, pages, interaction)
            
            pag.add_button("first", emoji="⏮️", style=discord.ButtonStyle.blurple)
            pag.add_button("prev", emoji="⏪", style=discord.ButtonStyle.blurple)
            pag.add_button("goto")
            pag.add_button("next", emoji="⏩", style=discord.ButtonStyle.blurple)
            pag.add_button("last", emoji="⏭️", style=discord.ButtonStyle.blurple)
            await pag.start()
            return
    
        await interaction.response.send_message(embed=discord.Embed(title="No hay canciones en la cola.", color=discord.Color.red()))
        
async def setup(bot):
    await bot.add_cog(queue(bot))