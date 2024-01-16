import discord
import re
from discord.ext import commands

SERVER_MSG = {
    'ServerID': None, 
    'Message': None
    }

SERVER_CH = {
    'ServerID': None, 
    'Channel': None
    }

SERVERS_MESSAGES = {
    'Server': {
        'channels': {
            'messages': {
                'emoji': {
                    'rol': {
                    
                    }
                }
            }
        }
    }
}

class Gestion_ext(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="channel", aliases=['ch'])
    async def set_channel(self, ctx, channel_id: int):
        """Configura el canal donde se enviarán los mensajes con reacciones."""
        server_id = ctx.guild.id
        SERVER_CH['ServerID'].add(server_id)

        SERVER_CH[server_id]['channel'].add(channel_id)
        embed = discord.Embed(
            title="Configuración Exitosa",
            description=f"Canal configurado correctamente. Todos los mensajes se enviarán a <#{channel_id}>.",
            color=discord.Colour.green()
        )
        await ctx.send(embed=embed)

    @commands.command(name="message", aliases=['msg'])
    async def set_message(self, ctx, message_id: int):
        """Configura el mensaje al que se aplicarán las reacciones y roles."""
        server_id = ctx.guild.id
        channel_id = SERVER_MSG[server_id]

        if server_id in SERVER_CH['ServerID']:
            
            




        if server_id in SERVERS_MESSAGES and channel_id:
            SERVERS_MESSAGES[server_id]['messages'].add(message_id)

            embed = discord.Embed(
                title="Configuración Exitosa",
                description=f"Mensaje configurado correctamente. Reacciones y roles se aplicarán al mensaje con ID {message_id}.",
                color=discord.Colour.green()
            )
            await ctx.send(embed=embed)
        else:
            embed = discord.Embed(
                title="Error de Configuración",
                description="Debes configurar primero el canal usando el comando `=channel`.",
                color=discord.Colour.red()
            )
            await ctx.send(embed=embed)

    @commands.command(name="show")
    async def show_config(self, ctx):
        """Muestra las configuraciones actuales del bot."""
        server_id = ctx.guild.id
        if server_id in SERVERS_MESSAGES:
            channel_id = SERVERS_MESSAGES[server_id]['channel_id']
            messages = SERVERS_MESSAGES[server_id]['messages']

            embed = discord.Embed(
                title="Configuración Actual",
                description=f"Canal configurado: <#{channel_id}>\nMensajes configurados: {messages}",
                color=discord.Colour.blue()
            )
            await ctx.send(embed=embed)
        else:
            embed = discord.Embed(
                title="Error de Configuración",
                description="Aún no se ha configurado el canal. Utiliza `=channel` para configurar el canal.",
                color=discord.Colour.red()
            )
            await ctx.send(embed=embed)

    @commands.command(name="add_message", aliases=['add'])
    async def add_reaction_message(self, ctx, role_name, emoji):
        """Crea un nuevo mensaje con una reacción y un rol asociado."""
        server = ctx.guild

        if server.id in SERVERS_MESSAGES:
            channel_id = SERVERS_MESSAGES[server.id]['channel_id']
            if not channel_id:
                embed = discord.Embed(
                    title="Error de Configuración",
                    description="Debes configurar primero el canal usando el comando `=channel`.",
                    color=discord.Colour.red()
                )
                await ctx.send(embed=embed)
                return

            message_content = f"Reacciona con {emoji} para obtener el rol {role_name} en este mensaje="
            message = await self.bot.get_channel(channel_id).send(message_content)

            role_id = int(re.match(r'<@&(\d+)>', role_name).group(1))
            print(role_name)
            role = discord.utils.get(server.roles, id=role_id)

            await message.add_reaction(emoji)

            SERVERS_MESSAGES[server.id]['messages'].add(message.id)
            SERVERS_MESSAGES[server.id]['emoji'].add(emoji)
            SERVERS_MESSAGES[server.id]['rol'].add(role)

            embed = discord.Embed(
                title="Mensaje Creado",
                description=f"Mensaje creado en <#{channel_id}>. Reacciona con {emoji} para obtener el rol {role_name}.",
                color=discord.Colour.green()
            )
            await ctx.send(embed=embed)

        else:
            embed = discord.Embed(
                title="Error de Configuración",
                description="Debes configurar primero el canal usando el comando `=channel`.",
                color=discord.Colour.red()
            )
            await ctx.send(embed=embed)

    @commands.Cog.listener()
    async def on_reaction_add(self, reaction, user):
        server_id = reaction.message.guild.id
        if server_id in SERVERS_MESSAGES:
            message_id = reaction.message.id
            if message_id in SERVERS_MESSAGES[server_id]['messages']:
                actual_emoji = str(reaction.emoji)
                if actual_emoji in SERVERS_MESSAGES[server_id]['emoji']:

                    guild = reaction.message.guild
                    member = guild.get_member(user.id)

                    role = SERVERS_MESSAGES[server_id]['rol']

                    if role:
                        await member.add_roles(role)
                        print(
                            f'Se ha agregado el rol {role.name} a {member.display_name}')
                    else:
                        print(f'No se encontró el rol')

    @commands.Cog.listener()
    async def on_reaction_remove(self, reaction, user):
        server_id = reaction.message.guild.id
        if server_id in SERVERS_MESSAGES:
            message_id = reaction.message.id
            if message_id in SERVERS_MESSAGES[server_id]['messages']:
                expected_emoji = reaction.message.content.split()[-5]
                actual_emoji = str(reaction.emoji)

                if expected_emoji == actual_emoji:
                    guild = reaction.message.guild
                    member = guild.get_member(user.id)

                    role_name = reaction.message.content.split()[-3]

                    if role_name.startswith('@'):
                        role_name = role_name[1:]

                    role = discord.utils.get(guild.roles, name=role_name)

                    if role:
                        await member.remove_roles(role)
                        print(
                            f'Se ha quitado el rol {role.name} a {member.display_name}')
                    else:
                        print(
                            f'No se encontró el rol con el nombre {role_name}')
                else:
                    print(
                        f'Emoji esperado ({expected_emoji}) diferente al emoji actual ({actual_emoji})')
