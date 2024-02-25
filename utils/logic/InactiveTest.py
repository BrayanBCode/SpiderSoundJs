import asyncio, discord

class InactiveClient():
    def __init__(self, guild):
        
        self.guild = guild
        self.active = False
        
    async def Timer(self, VoiceClient: discord.VoiceClient):
        if not self.active:
            self.active = True
            asyncio.sleep(120)
            if not VoiceClient.is_playing():
                VoiceClient.disconnect()    
                self.active = False
            
        else:
            print("Timer activo")