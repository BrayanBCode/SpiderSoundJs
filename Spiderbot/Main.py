import os
import sys
import discord

from discord.ext import commands
from dotenv import load_dotenv
from discord import Activity, ActivityType

import traceback

try:
    from utils.extensions.Music_Extend import Music_Ext
except Exception as e:
    # Aquí capturas el error y lo muestras
    print("Ha ocurrido un error:", e)
    print("El traceback es:")
    traceback.print_exc()
load_dotenv()

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="=", intents=intents)

bot.remove_command('help')

#! eventos --------------------------------------------------------------------

@bot.event
async def on_ready():
    #HOlaaa esto es un test Puto
    await Status()
    try:
        await bot.add_cog(Music_Ext(bot))

    except Exception as e:
        print(str(e))

async def Status():
    status = 1
    print(f"Ya estoy activo {bot.user} al servicio")
    if status == 1:
        custom_status = Activity(
            name='Music Player "=help"', type=ActivityType.playing)
        await bot.change_presence(status=discord.Status.online, activity=custom_status)
    else:
        custom_status = Activity(
            name="Fuera de Servicio", type=ActivityType.playing)
        await bot.change_presence(activity=custom_status, status=discord.Status.do_not_disturb)

# * Comandos -------------------------------------------------------------------

@bot.command()
async def help(ctx):
    embed = discord.Embed(title="Guia de de comandos",
                          description="En esta guia se nombraran los comandos implementados en el Bot.", color=0x7289DA)
    embed.add_field(name=f"**{bot.command_prefix}play**",
                    value=f"Para reproducir música, simplemente escribe **{bot.command_prefix}play** seguido del nombre de la canción, el artista o la URL de la canción que desees escuchar.", inline=False)
    embed.add_field(name=f"**{bot.command_prefix}stop**",
                    value=f"Para pausar la comandos.Musica utilize **{bot.command_prefix}stop** una vez para reanudar la comandos.Musica utilize **{bot.command_prefix}stop** nuevamente", inline=False)
    embed.add_field(name=f"**{bot.command_prefix}skip**",
                    value=f"Para saltear una cancion utilize **{bot.command_prefix}skip**, para saltear varias agrege un numero, ejemplo: **{bot.command_prefix}skip 3**", inline=False)
    embed.add_field(name=f"**{bot.command_prefix}queue**",
                    value=f"Muestra la playlist y la cancion que se esta reproduciendo actualmente", inline=False)
    embed.add_field(name=f"**{bot.command_prefix}remove**",
                    value=f"Quita de la playlist la cancion que el usuario desee ejemplo: **{bot.command_prefix}remove 5**", inline=False)
    embed.add_field(name=f"**{bot.command_prefix}clear**",
                    value=f"Limpia la playlist", inline=False)
    embed.add_field(name=f"**{bot.command_prefix}loop**",
                    value=f"Activa el modo loop de la playlist lo que hace que se repita indefinidamente la playlist.", inline=False)
    embed.add_field(name=f"\n**Novedades**",
                    value=f"+ Ahora admitimos canciones y playlist de Spotify", inline=False)

    await ctx.send(embed=embed)

# * Comandos comandos.Musica ---------------------------

bot.run(os.environ.get("TOKEN"))
