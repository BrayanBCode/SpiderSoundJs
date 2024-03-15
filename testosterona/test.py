import requests


def getsumm(summoner):
    api_key = "RGAPI-f987fe75-ec7d-447e-a433-f73b4fb35b9d"
    
    api_url = f"https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-name/{summoner}"
    api_url += '?api_key='+ api_key
    resp = requests.get(api_url)
    player_info = resp.json()
    return(player_info["summonerLevel"])