
class MediaPlayerStructure:
    def __init__(self, bot, guild) -> None:
        self.bot = bot
        self.guild = guild
        
    def GetGuild(self):
        return self.guild
    
    def GetBot(self):
        return self.bot
    
    def check(self, guild):
        return guild == self.guild.id
    
    def DurationFormat(self, seconds: int):
        mins, secs = divmod(seconds, 60)
        hours, mins = divmod(mins, 60)
        duration_formatted = '{:02d}:{:02d}:{:02d}'.format(hours, mins, secs)
        return duration_formatted

    
class HelpCommandMsg():
    def __init__(self, title, description) -> None:
        self.title = title
        self.description = description
        
    def save(self, embed):
        embed.add_field(name=self.title, value=self.description, inline=False)