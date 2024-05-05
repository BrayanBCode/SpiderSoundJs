import discord, os
from discord.ext import commands
import youtube_dl
from dotenv import load_dotenv

# Crea una instancia del bot
load_dotenv()  # load all the variables from the env file

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)
bot.remove_command('help')

@bot.command(name='play')
async def play(ctx, url):
    # Conéctate al canal de voz del usuario
    if not ctx.message.author.voice:
        await ctx.send("No estás conectado a un canal de voz.")
        return
    else:
        channel = ctx.message.author.voice.channel
    voice_channel = await channel.connect()

    # Configura las opciones de youtube_dl
    ydl_opts = {'format': 'bestaudio'}
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        url2 = info['formats'][0]['url']
        voice_channel.play(discord.FFmpegPCMAudio(url2))
        await ctx.send('Reproduciendo...')

@bot.command(name='stop')
async def stop(ctx):
    voice_client = discord.utils.get(bot.voice_clients, guild=ctx.guild)
    if voice_client.is_playing():
        voice_client.stop()
        await ctx.send('La música se ha detenido.')
    else:
        await ctx.send('No se está reproduciendo ninguna música en este momento.')

# Ejecuta el bot
bot.run(os.getenv('TEST'))  # run the bot with the token
