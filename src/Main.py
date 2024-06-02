import discord
import os, sys  # default module

from dotenv import load_dotenv
from discord.ext import bridge

# Añadir la carpeta raíz del proyecto a sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, '..'))
sys.path.insert(0, root_dir)


load_dotenv()  # load all the variables from the env file

intents = discord.Intents.default()
intents.message_content = True

bot = bridge.Bot(command_prefix="=", intents=intents)
bot.remove_command('help')

cogs_list = [  # listado de cogs
    'Music',
    'Help'
]

for cog in cogs_list:
    bot.load_extension(f'src.utils.Commands.{cog}')

# Deprecated
# def eliminar_archivos(carpeta="./temp"):
#     for nombre_archivo in os.listdir(carpeta):
#         archivo = os.path.join(carpeta, nombre_archivo)
#         try:
#             if os.path.isfile(archivo) or os.path.islink(archivo):
#                 os.unlink(archivo)
#             elif os.path.isdir(archivo):
#                 shutil.rmtree(archivo)
#             print("Archivo eliminado: %s" % archivo)
#         except Exception as e:
#             print('Error al eliminar %s. Razón: %s' % (archivo, e))


@bot.event
async def on_ready():
    # eliminar_archivos()
    print(f"{bot.user} esta en linea!")


bot.run(os.getenv('TEST'))  # run the bot with the token
