import asyncio
import json

from base.classes.Youtube import Youtube

async def test():
    yt = Youtube()
    with open("sample.json", "w", encoding="utf-8") as outfile: 
        outfile.write("get_video_info\n")
        json.dump(await yt.get_video_info("https://www.youtube.com/watch?v=AhZvCgk1Ay4"), outfile, indent=4)
        outfile.write("get_search\n")
        json.dump(await yt.get_search("SINVERGÜENZA - Emanero (Video Oficial)"), outfile, indent=4)
        outfile.write("get_playlist_info\n")
        json.dump(await yt.get_playlist_info("https://www.youtube.com/playlist?list=PL3tKo37yAfLXQodqxfH4ipropqe17CbB0"), outfile, indent=4)
        outfile.write("\n")

# Asegúrate de incluir la llamada a asyncio.run(test()) si es el punto de entrada.
asyncio.run(test())