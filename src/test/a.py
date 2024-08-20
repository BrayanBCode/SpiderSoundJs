import re

# https://www.youtube.com/watch?v=R9NxCd0pPQk&list=RDDfEBmXxh1cA&start_radio=1
# https://www.youtube.com/watch?v=F4i3O7T488I
# https://youtu.be/F4i3O7T488I?si=t120V_0cOj68-5wc

def match():
    url = 'https://www.youtube.com/watch?v=F4i3O7T488I'

    url = 'https://www.youtube.com/watch?v=R9NxCd0pPQk&list=RDDfEBmXxh1cA&start_radio=1'

    # print(re.match(r'https?://(www\.)?youtube\.com/watch?v=[a-zA-Z0-9_-]+(&list=RD[a-zA-Z0-9_-]+)?', url))
    matches = re.match(r'((https|http)?://)?(www\.)?(youtube.com/watch\?v=|youtu.be).[a-zA-Z0-9-_]+.(si=[a-zA-Z0-9-_]+)?(?![^ ]*&list=)', url)


    print("-- match:", matches.group(0))

        # if "youtube.com/playlist" in url or "list=PL" in url:
        #     return "playlist", await self.get_playlist_info(url)
        # elif "start_radio=" in url or 'list=RD' in url:
        #     return "radio", await self.get_playlist_info(url)
        # elif "youtube.com/watch" in url or "youtu.be" in url:
        #     return "video", await self.get_video_info(url)
        # elif "open.spotify.com" in url:
        #     return "spotify", None 
        # else:
        #     return "search", await self.get_search(url)


def find():
    text = """
    https://www.youtube.com/watch?v=R9NxCd0pPQk
    https://www.youtube.com/watch?v=F4i3O7T488I&list=RDDfEBmXxh1cA
    https://youtu.be/F4i3O7T488I?si=t120V_0cOj68-5wc
    """

    # Regex para coincidir con URLs de YouTube que NO contienen '&list='
    # pattern = r'https?://(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[a-zA-Z0-9_-]+(?![^ ]*&list=)'
    pattern = r'https?://(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[a-zA-Z0-9_-]+'

    matches = re.findall(pattern, text)

    for match in matches:
        print(match)

match()
# find()