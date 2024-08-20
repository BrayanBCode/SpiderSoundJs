import re

regex = r"https:\/\/www\.youtube\.com\/watch\?v=(.+)&list=(.+)&index=([0-9]+)"

matches = re.match(regex, "https://www.youtube.com/watch?v=k7irue3-ZEM&list=RDDfEBmXxh1cA&index=4")

if matches:

    url = f"https://www.youtube.com/watch?v={matches.group(1)}&list={matches.group(2)}&start_radio=1"
    print(url)
    print("martch 1:", matches.group(1))
    print("martch 2:", matches.group(2))    
