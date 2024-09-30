import asyncio
import json

from base.classes.Youtube import Youtube


async def test():
    yt = Youtube()
    with open("sample.json", "w", encoding="utf-8") as outfile:
        outfile.write("getVideoInfo\n")
        json.dump(
            await yt.getVideoInfo("https://www.youtube.com/watch?v=AhZvCgk1Ay4"),
            outfile,
            indent=4,
        )
        outfile.write("getSearch\n")
        json.dump(
            await yt.getSearch("SINVERGÜENZA - Emanero (Video Oficial)"),
            outfile,
            indent=4,
        )
        outfile.write("getPlaylistInfo\n")
        json.dump(
            await yt.getPlaylistInfo(
                "https://www.youtube.com/playlist?list=PL3tKo37yAfLXQodqxfH4ipropqe17CbB0"
            ),
            outfile,
            indent=4,
        )
        outfile.write("\n")


# Asegúrate de incluir la llamada a asyncio.run(test()) si es el punto de entrada.
asyncio.run(test())


# https://www.youtube.com/watch?v=7V3zyLm82_4&list=RD7V3zyLm82_4&index=2
# https://www.youtube.com/watch?v=DfEBmXxh1cA&list=RDDfEBmXxh1cA&start_radio=1&rv=DfEBmXxh1cA&t=0


# https://www.youtube.com/watch?v=7V3zyLm82_4&list=RD7V3zyLm82_4&index=2
# https://www.youtube.com/watch?v=7V3zyLm82_4&list=RD7V3zyLm82_4&start_radio=1&rv=DfEBmXxh1cA&t=0
