import json

import discord
from discord.ext import commands
from discord.ext.commands import command

from base.classes.SpiderPlayer.player import Player
from base.utils.Logging.LogMessages import LogAviso
from components.AlbumMenus.ControlMenuView import ControlMenu


class Test(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        LogAviso("[Prefix Command] TestCommands cargado.").print()

    @discord.app_commands.command(name="testcog", description="Comando de prueba")
    async def testcog(self, interaction: discord.Interaction):
        view = ControlMenu(self.bot)
        await interaction.response.send_message(
            "Menu de albums",
            view=view,
            ephemeral=True,
        )

    @command()
    async def settings(self, ctx: commands.Context):

        player: Player = self.bot.players.getPlayer(ctx.guild.id)

        await ctx.send(
            embed=discord.Embed(
                title=f"Configuracion de ``{ctx.guild.name}``",
                description=f"{json.dumps(player.guild.toDict(), indent=3)}",
                color=discord.Color.green(),
            ),
            delete_after=10,
        )

        # user = User(self.bot.DBConnect, userData={
        #     "_id": ctx.author.id
        # })
        # user.load_by_id()

        # await ctx.send(
        #     embed=discord.Embed(
        #         title=f"Configuracion de ``{ctx.author.nick}``",
        #         description=f"{json.dumps(user.toDict(), indent=3)}",
        #         color=discord.Color.green()
        #         )
        #     )

    @command()
    async def errorleave(self, ctx: commands.Context):

        player: Player = self.bot.players.getPlayer(ctx.guild.id)

        await player.VoiceClient.disconnect(force=True)

        await ctx.send(
            embed=discord.Embed(
                title="Simulacion de error",
                description="Desconexion forzosa"
            )
        )

    @command()
    async def test(self, ctx: commands.Context):

        guilds = self.bot.players.getGuilds().values()

        for guild in guilds:
            guild: Player
            print(self.bot.get_guild(guild.guild._id))

        await ctx.send(
            embed=discord.Embed(
                title="Test",
                description=[guild for guild in guilds]
            )
        )

    @command()
    async def status(self, ctx: commands.Context):

        player: Player = self.bot.players.getPlayer(ctx.guild.id)
        emb = discord.Embed(
                title="Status",
                description=f"Servidor: {self.bot.get_guild(player.guild._id)}"
            )
        emb.add_field(
            name="queue:",
            value=[video.title for video in player.queue[:10]],
            inline=False
        )
        emb.add_field(
            name="current_song:",
            value=player.current_song.title,
            inline=False
        )
        emb.add_field(
            name="VoiceClient:",
            value=f"is_connected: {player.VoiceClient.is_connected()} \nis_paused: {player.VoiceClient.is_paused()} \nis_playing: {player.VoiceClient.is_playing()}" if player.VoiceClient else "None",
            inline=False
        )
        emb.add_field(
            name="textChannel:",
            value=player.textChannel,
            inline=False
        )
        emb.add_field(
            name="stoped:",
            value=player.stoped,
            inline=False
        )
        emb.add_field(
            name="loop:",
            value=player.loop,
            inline=False
        )
        emb.add_field(
            name="playingMsg:",
            value=player.playingMsg,
            inline=False
        )
        emb.add_field(
            name="shouldReconnect:",
            value=player.shouldReconnect,
            inline=False
        )
        emb.add_field(
            name="last_voice_channel:",
            value=player.last_voice_channel,
            inline=False
        )
        emb.add_field(
            name="DisconnectTimer:",
            value=player.DisconnectTimer,
            inline=False
        )
        emb.add_field(
            name="last_Interaction:",
            value=player.last_Interaction,
            inline=False
        )
        emb.add_field(
            name="lastSong:",
            value=player.lastSong.title,
            inline=False
        )
        emb.add_field(
            name="pausedDisconnect:",
            value=player.pausedDisconnect,
            inline=False
        )

        
        await ctx.send(
            embed=emb
        )



async def setup(bot):
    await bot.add_cog(Test(bot))











