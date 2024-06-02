import discord

class MusicControls(discord.ui.View):
    def __init__(self, cog, ctx, get_ctx: callable):
        super().__init__()
        self.cog = cog
        self.ctx = ctx
        self.get_ctx = get_ctx

    def actualizar(self, guild_id):
        self.ctx = self.cog.get_ctx(guild_id)
    @discord.ui.button(emoji='⏹️', style=discord.ButtonStyle.primary)
    async def stop(self, button, interaction):
        self.actualizar(interaction.guild_id)
        voice_client = self.ctx.voice_client
        if voice_client.is_playing() or voice_client.is_paused():
            voice_client.stop()

    @discord.ui.button(emoji='⏸️', style=discord.ButtonStyle.primary)
    async def pause(self, button, interaction):
        self.actualizar(interaction.guild_id)
        voice_client = self.ctx.voice_client
        if voice_client.is_playing():
            voice_client.pause()

    @discord.ui.button(emoji='▶️', style=discord.ButtonStyle.primary)
    async def resume(self, button, interaction):
        self.actualizar(interaction.guild_id)
        voice_client = self.ctx.voice_client
        if voice_client.is_paused():
            voice_client.resume()

    @discord.ui.button(emoji='⏩', style=discord.ButtonStyle.primary)
    async def skip(self, button, interaction):
        self.actualizar(interaction.guild_id)
        voice_client = self.ctx.voice_client
        if voice_client.is_playing() or voice_client.is_paused():
            voice_client.stop()
        await self.cog.PlaySong(self.ctx)