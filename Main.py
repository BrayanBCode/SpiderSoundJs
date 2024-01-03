import os, sys, discord
from discord.ext import commands
import comandos.Musica 
from dotenv import load_dotenv
import pkgutil

load_dotenv()
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix = "=", intents=intents, help_command=None)

#! eventos --------------------------------------------------------------------

@bot.event # Ejecutar la función cuando el bot se una a un canal de voz en un servidor
async def on_voice_state_update(member, before, after):
    if('comandos.Musica' in sys.modules):
        await comandos.comandos.Musica.Event(member, before, after, bot)

@bot.event
async def on_ready():
    if('comandos.Musica' in sys.modules):
        await comandos.comandos.Musica.startup(bot)
    
@bot.command() #Reinicia el bot con un comando
async def restart(ctx):
    await ctx.send('Reiniciando...')
    os.execv(sys.executable, ['python'] + ['"{}"'.format(arg) for arg in sys.argv])

#* Comandos -------------------------------------------------------------------

@bot.command()
async def help(ctx):
    embed = discord.Embed(title="Guia de de comandos", description="En esta guia se nombraran los comandos implementados en el Bot.", color=0x7289DA)
    if('comandos.Musica' in sys.modules):
        embed.add_field(name=f"**{bot.command_prefix}play**", value=f"Para reproducir música, simplemente escribe **{bot.command_prefix}play** seguido del nombre de la canción, el artista o la URL de la canción que desees escuchar.", inline=False)
        embed.add_field(name=f"**{bot.command_prefix}stop**", value=f"Para pausar la comandos.Musica utilize **{bot.command_prefix}stop** una vez para reanudar la comandos.Musica utilize **{bot.command_prefix}stop** nuevamente", inline=False)
        embed.add_field(name=f"**{bot.command_prefix}skip**", value=f"Para saltear una cancion utilize **{bot.command_prefix}skip**, para saltear varias agrege un numero, ejemplo: **{bot.command_prefix}skip 3**", inline=False)
        embed.add_field(name=f"**{bot.command_prefix}queue**", value=f"Muestra la playlist y la cancion que se esta reproduciendo actualmente", inline=False)
        embed.add_field(name=f"**{bot.command_prefix}remove**", value=f"Quita de la playlist la cancion que el usuario desee ejemplo: **{bot.command_prefix}remove 5**", inline=False)
        embed.add_field(name=f"**{bot.command_prefix}clear**", value=f"Limpia la playlist", inline=False)
        embed.add_field(name=f"**{bot.command_prefix}loop**", value=f"Activa el modo loop de la playlist lo que hace que se repita indefinidamente la playlist.", inline=False)

    await ctx.send(embed=embed)


#* Comandos comandos.Musica ---------------------------
if('comandos.Musica' in sys.modules):
    @bot.command()
    async def play(ctx, *, command):
        await comandos.Musica.AddSongs(ctx, command, bot)

    @bot.command()
    async def p(ctx, *, command):
        await comandos.Musica.AddSongs(ctx, command, bot)

    @bot.command()
    async def stop(ctx):
        await comandos.Musica.stop(ctx)

    @bot.command()
    async def queue(ctx):
        await comandos.Musica.queue(ctx, bot)

    @bot.command()
    async def skip(ctx, command: int = 1):
        await comandos.Musica.skip(ctx, command)

    @bot.command()
    async def clear(ctx):
        await comandos.Musica.clear(ctx)

    @bot.command()
    async def remove(ctx, command):
        await comandos.Musica.remove(ctx, command)
        
    @bot.command()
    async def loop(ctx):
        await comandos.Musica.loop(ctx)

#* Comandos Gestion --------------------------
    



    
bot.run(os.environ.get("token"))