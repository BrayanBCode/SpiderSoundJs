import discord
from discord.ext import commands
from discord.ext.commands import Cog

# from googleapiclient.discovery import build

# youtube = build('youtube', 'v3', developerKey='AIzaSyCf4qHNcwgJjOBYN0SGiikTmpMF5gBHcEs')

class Play(Cog):
    def __init__(self, bot) -> None:
        self.bot = bot
        print("Play cog loaded")

    
    @discord.app_commands.command(name="play", description="Reproduce un video de YouTube")
    @discord.app_commands.describe(search="search")
    async def play(self, interaction: discord.Interaction, search: str):
        await interaction.response.send_message(f"Reproduciendo {search}...")

    # @play.autocomplete(name="search")
    # async def youtube_search_autocomplete(self, interaction: discord.Interaction, current: str) -> list[discord.app_commands.Choice]:
    #     choices = []
    #     for choice in ["Despacito", "Shape of You", "See You Again"]:
    #         choices.append(discord.app_commands.Choice(name=choice, value=choice))

    #     return choices

        # search_response = youtube.search().list(
        #     q=search_query,
        #     part='id,snippet',
        #     maxResults=5  # Limita los resultados para hacer más rápida la respuesta
        # ).execute()

        # choices = []
        # for search_result in search_response.get('items', []):
        #     if search_result['id']['kind'] == 'youtube#video':
        #         video_title = search_result['snippet']['title']
        #         choices.append(discord.app_commands.Choice(name=video_title, value=video_title))

        # return choices

async def setup(bot: commands.Bot):
    await bot.add_cog(Play(bot))