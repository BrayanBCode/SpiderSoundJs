import discord

class MusicControls(discord.ui.View):
    def __init__(self, cog, ctx):
        super().__init__()
        self.cog = cog
        self.ctx = ctx

    @discord.ui.button(emoji='⏸️', style=discord.ButtonStyle.primary)
    async def pause(self, button, interaction):
        voice_client = self.ctx.voice_client
        if voice_client.is_playing():
            voice_client.pause()

    @discord.ui.button(emoji='▶️', style=discord.ButtonStyle.primary)
    async def resume(self, button, interaction):
        interaction.defer()
        voice_client = self.ctx.voice_client
        if voice_client.is_paused():
            voice_client.resume()

    @discord.ui.button(emoji='⏹️', style=discord.ButtonStyle.primary)
    async def stop(self, button, interaction):
        interaction.defer()
        voice_client = self.ctx.voice_client
        if voice_client.is_playing() or voice_client.is_paused():
            voice_client.stop()

    @discord.ui.button(emoji='⏩', style=discord.ButtonStyle.primary)
    async def skip(self, button, interaction):
        voice_client = self.ctx.voice_client
        if voice_client.is_playing() or voice_client.is_paused():
            voice_client.stop()
        await interaction.edit(embed=await self.cog.PlaySong(self.ctx))