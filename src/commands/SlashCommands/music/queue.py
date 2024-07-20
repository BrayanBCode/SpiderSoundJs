import discord
from buttons import button_paginator as pg

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
                await interaction.response.send_message(embed=discord.Embed(title="No hay canciones en la cola.", color=discord.Color.red()), ephemeral=True)
                return
            
            pages = []
            for i in range(0, len(player.queue), 7):
                embed = discord.Embed(title="Canciones en la cola", color=Colours.default())
                embed.set_footer(text=f"Pedido por {interaction.user.display_name}", icon_url=interaction.user.avatar.url)
                embed.timestamp = interaction.created_at

                for index, song in enumerate(player.queue[i:i+7], start=i+1):
                    embed.add_field(name=f"{index}. {song.title}", value=f"Duración: {self.setDuration(song.duration)}", inline=False)
                
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
        
    def setDuration(self, duration):
        hours, remainder = divmod(duration, 3600)
        minutes, seconds = divmod(remainder, 60)

        # Redondear minutos si los segundos son 30 o más
        if seconds >= 30:
            minutes += 1
        if minutes >= 60:
            minutes = 0
            hours += 1

        # Ajustar para que los segundos se muestren siempre
        # Convierte minutes, hours y seconds a enteros antes de formatear
        hours = int(hours)
        minutes = int(minutes)
        seconds = int(seconds) % 60  # Asegurar que los segundos sean correctos después de redondear minutos

        # Construir el string de duración basado en las condiciones de horas, minutos y segundos
        duration_parts = []
        if hours > 0:
            duration_parts.append(f"{hours:02d}")
        if minutes > 0 or hours > 0:
            duration_parts.append(f"{minutes:02d}")
        duration_parts.append(f"{seconds:02d}")  # Incluir siempre los segundos

        return ":".join(duration_parts)
    
async def setup(bot):
    await bot.add_cog(queue(bot))