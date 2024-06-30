from discord import VoiceChannel, FFmpegPCMAudio
import discord
from discord.ext import commands
import yt_dlp

from base.interfaces.IPlayList import IPlayList
from base.interfaces.ISearchResults import ISearchResults
from base.interfaces.ISong import ISong


class Youtube():
    async def get_audio_stream(self, url):
        ydl_opts = {
            'format': 'bestaudio',
            'quiet': True,
            'no_warnings': True,
            'default_search': 'auto',
            'source_address': '0.0.0.0'
        }
    
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            audio_url = info['url']
            ffmpg_audio = FFmpegPCMAudio(audio_url, before_options="-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5")
        return audio_url, ffmpg_audio
    
    async def get_video_info(self, url) -> ISong:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'default_search': 'auto',
            'extract_flat': True,
        }                                   
    
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return ISong(
                title=info.get('title'),
                url=f"https://www.youtube.com/watch?v={info.get('id')}",
                duration=info.get('duration'),
                uploader=info.get('uploader'),
                thumbnail=info.get('thumbnail')
                )
    
    async def get_search(self, query) -> ISearchResults:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'default_search': 'auto',
            'extract_flat': True,  # Importante para playlists, evita descargar los videos.
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(f"ytsearch1:{query}", download=False)
            
            videos = [
                ISong(
                    title=video.get('title'),
                    url=f"https://www.youtube.com/watch?v={video.get('id')}",
                    duration=video.get('duration'),
                    uploader=video.get('uploader')
                    ) for video in result['entries']
            ]

            return ISearchResults(search=query, results=videos)
        
    async def get_playlist_info(self, url) -> IPlayList:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'default_search': 'auto',
            'extract_flat': True,  # Importante para playlists, evita descargar los videos.
            'playlistend': 100,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            videos = [
                ISong(
                    title=video.get('title'),
                    url=f"https://www.youtube.com/watch?v={video.get('id')}",
                    duration=video.get('duration'),
                    uploader=video.get('uploader')
                    ) for video in info['entries']
            ]
            return IPlayList(
                title=info.get('title'),
                url=info.get('original_url'),
                uploader=info.get('uploader'),
                thumbnail=info.get('thumbnail'),
                entries=videos
            )
        
    async def Search(self, url):
        if "youtube.com/playlist" in url or "list=PL" in url:
            return "playlist", await self.get_playlist_info(url)
        elif "start_radio=" in url:
            return "radio", await self.get_playlist_info(url)
        elif "youtube.com/watch" in url:
            return "video", await self.get_video_info(url)
        elif "open.spotify.com" in url:
            return "spotify", None 
        else:
            return "search", await self.get_search(url)
