import discord
from discord.ext import commands
from utils.logic import Structures

class Help_Cog(commands.Cog):
    def __init__(self, bot) -> None:
        self.bot = bot
         
    @discord.slash_command(name='help', description='Despliega la guia de comandos')
    async def help (self, ctx) -> None:
        
        embed=discord.Embed(title="Guia de comandos", description="En esta guia se nombraran los comandos implementados en el Bot.", color=0x120062)
        for field in slashHelpStructure():
            field.save(embed)
        await ctx.respond(embed=embed)
        
def slashHelpStructure():
    HelpDic = [
        Structures.HelpCommandMsg('/play', 'Reporducir musica, escribe el nombre de la canción, el artista o la URL de la canción que desees escuchar, se admiten playlist de Spotify.'),
        Structures.HelpCommandMsg('/pause','Pausa la reproduccion de la musica'),
        Structures.HelpCommandMsg('/resume', 'Reanuda la reproduccion de la musica'),
        Structures.HelpCommandMsg('/stop', 'Detiene la reproduccion de la musica'),
        Structures.HelpCommandMsg('/skip', 'Salta una o varias canciones'),
        Structures.HelpCommandMsg('/queue', 'Muestra la cola de reproduccion'),
        Structures.HelpCommandMsg('/remove', 'Quita una cancion de la cola de reproduccion'),
        Structures.HelpCommandMsg('/clear', 'Limpia la cola de reproduccion'),
        Structures.HelpCommandMsg('/loop', 'Activa o desactiva el loop en al cola de reproduccion'),
        Structures.HelpCommandMsg('/leave', 'Desconecta el bot del canal'),
        Structures.HelpCommandMsg('/join', 'Mueve o conecta el bot a tu canal de voz actual')
        ]
    return HelpDic
    
def setup(bot):
    bot.add_cog(Help_Cog(bot))