import requests

class SummonerClass():
    def __init__(self) -> None:
        self.Summoner = None
    
    def getsumm(self,summoner):
        api_key = "RGAPI-f987fe75-ec7d-447e-a433-f73b4fb35b9d"
        api_url = f"https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-name/{summoner}"
        api_url += '?api_key='+ api_key
        resp = requests.get(api_url)
        player_info = resp.json()
        self.Summoner = player_info


    def setlvl(self):
        lvl = self.Summoner["summonerLevel"]
        return lvl

    def seticon(self):
        icon = self.Summoner["profileIconId"]
        return f"https://ddragon.leagueoflegends.com/cdn/11.14.1/img/profileicon/{icon}.png"
    
    def setname(self):
        name = self.Summoner["name"]
        return name