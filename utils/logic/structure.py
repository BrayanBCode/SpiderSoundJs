
class MediaPlayerStructure:
    def __init__(self, bot, guild) -> None:
        self.bot = bot
        self.guild = guild
        
    def GetGuild(self):
        return self.guild
    
    def GetBot(self):
        return self.bot
    
    def check(self, guild):
        if guild == self.guild.id:
            return True
        else:
            return False
    
    