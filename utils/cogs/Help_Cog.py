import discord
from discord.ext import commands

class Help_Cog(commands.Cog):
    def __init__(self, bot) -> None:
        self.bot = bot
         
    @discord.slash_command(name='help', description='Despliega la guia de comandos')
    async def help (self, ctx) -> None:
        
        embed=discord.Embed(title="Guia de comandos", description="En esta guia se nombraran los comandos implementados en el Bot.", color=0x120062)
        for field in self.slashHelpStructure():
            embed.add_field(name=field['title'], value=field['description'], inline=False)
        await ctx.respond(embed=embed)
        
    def slashHelpStructure():
        HelpDic = [
            {
                'title': '/play',
                'description': 'Reporducir musica, escribe el nombre de la canción, el artista o la URL de la canción que desees escuchar, se admiten playlist de Spotify.'
            },
            {
                'title': '/pause',
                'description': 'Pausa la reproduccion de la musica'
            },
            {
                'title': '/resume',
                'description': 'Reanuda la reproduccion de la musica'
            },
            {
                'title': '/stop',
                'description': 'Detiene la reproduccion de la musica'
            },
            {
                'title': '/skip',
                'description': 'Salta una o varias canciones'
            },
            {
                'title': '/queue',
                'description': 'Muestra la cola de reproduccion'
            },
            {
                'title': '/remove',
                'description': 'Quita una cancion de la cola de reproduccion'
            },
            {
                'title': '/clear',
                'description': 'Limpia la cola de reproduccion'
            },
            {
                'title': '/loop',
                'description': 'Activa o desactiva el loop en al cola de reproduccion'
            },
            {
                'title': '/leave',
                'description': 'Desconecta el bot del canal'
            },
            {
                'title': '/join',
                'description': 'Mueve o conecta el bot a tu canal de voz actual'
            }
        ]
        return HelpDic
    
def setup(bot):
    bot.add_cog(Help_Cog(bot))