
from discord import VoiceClient

class MediaPlayer():
    def __init__(self, Voice_client: VoiceClient) -> None:
        self.voice_client = Voice_client
        
    def status(self):
        print(f"""
              Conectado a un canal de voz: {self.voice_client.is_connected()}
              Esta pausado: {self.voice_client.is_paused()}
              Esta reproducion: {self.voice_client.is_playing()}
              """)    
    
    def play(self, source):
        self.voice_client.play(source)