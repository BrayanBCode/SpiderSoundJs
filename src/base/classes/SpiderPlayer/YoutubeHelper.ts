import ytdl from 'ytdl-core';
import ytpl from 'ytpl';
import ytSearch from 'yt-search';
import Song from './Song';
import axios from 'axios';
import ytdlExec from 'youtube-dl-exec';

class YouTubeHelper {
    async getVideoInfo(videoUrl: string) {
        const info = await ytdl.getInfo(videoUrl);
        return new Song({
            title: info.videoDetails.title,
            artist: info.videoDetails.author.name,
            url: videoUrl,
            duration: info.videoDetails.lengthSeconds,
            thumbnail: info.videoDetails.thumbnails[0].url,
            videos: null
        });
    }

    async getPlaylistInfo(playlistId: string) {
        const playlist = await ytpl(playlistId);
        console.log("video: ")

        return new Song({
            title: playlist.title,
            artist: playlist.author.name,
            url: playlist.url,
            duration: this.getSecondsfromPlaylist(playlist),
            thumbnail: playlist.bestThumbnail.url!,
            videos: playlist.items.map((video: any) => (
                new Song({
                    title: video.title,
                    artist: video.author.name,
                    url: video.url,
                    duration: video.lengthSeconds,
                    thumbnail: video.bestThumbnail.url,
                    videos: null
                })
            ))
        });
    }

    async searchVideos(searchTerm: string) {
        const { videos } = await ytSearch(searchTerm);
        const Videos = videos.map(video => new Song({
            title: video.title,
            artist: video.author.name,
            url: video.url,
            duration: video.duration.seconds,
            thumbnail: video.image,
            videos: null
        }));
        return Videos.slice(0, 5);
    }

    async getMixInfo(mixId: string) {
        throw new Error('Método no implementado');
        try {
            const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
                params: {
                    part: 'snippet',
                    maxResults: 10,
                    playlistId: mixId,
                    key: "AIzaSyCf4qHNcwgJjOBYN0SGiikTmpMF5gBHcEs",
                },
            });

            // Procesa la respuesta JSON aquí
            const items = response.data.items;
            const songs = items.map((item: any) => {
                const snippet = item.snippet;
                return {
                    title: snippet.title,
                    artist: snippet.videoOwnerChannelTitle,
                    url: `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`,
                    // Otras propiedades como duración, miniatura, etc.
                };
            });

            return songs;
        } catch (error) {
            console.error('Error al obtener información del mix:', error);
            return null;
        }
    }

    identifySearchType(searchParam: string) {
        if (searchParam.includes('youtube.com/watch?v=')) {
            if (searchParam.includes('&list=RD')) {
                // Si el enlace contiene '&list=RD', es un mix
                return 'mix';
            } else if (searchParam.includes('&list=')) {
                // Si solo contiene '&list=', pero no comienza con 'RD', es una playlist
                return 'playlist';
            }
            // Si no contiene '&list=', es un video individual
            return 'video';
        } else if (searchParam.includes('youtube.com/playlist?list=')) {
            // Si el enlace es directamente a una playlist
            return 'playlist';
        } else {
            // Si no coincide con los anteriores, se trata de una búsqueda
            return 'search';
        }
    }

    async getStream(video: string, options: { startTime: number }) {
        try {
            // Construye la URL del video con el tiempo de inicio si es necesario
            const videoUrl = options.startTime ? `${video}&t=${options.startTime}s` : video;

            // Ejecuta youtube-dl para obtener la URL del stream de audio
            const result = await ytdlExec(video, {
                dumpSingleJson: true,
                noWarnings: true,
                preferFreeFormats: true,
                youtubeSkipDashManifest: true,
                format: 'bestaudio'
            });

            // Devuelve la URL del stream de audio
            if ((result as any).url) {
                console.log('URL del stream de audio:', (result as any).url);
                return (result as any).url;
            } else {
                throw new Error('No se pudo obtener la URL del stream de audio.');
            }
        } catch (error) {
            console.error('Error al obtener el stream de audio:', error);
            throw error;
        }
    }

    private getSecondsfromPlaylist(playlist: ytpl.Result) {
        return playlist.items.map((video: any) => video.durationSec).reduce((acc: number, cur: number) => acc + cur, 0);

    }
}

export default new YouTubeHelper;
// https://youtu.be/22aBr6luZAQ?si=4_3OEMwP2pYkBRik
// https://youtu.be/22aBr6luZAQ?si=4_3OEMwP2pYkBRik&t=3