class Channel:
    id = 0000
    channel = []
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def showInstance(self):
        print(f'Channel:\nid: {self.id}\n {self.channel}')

    def getMessages(self):
        if len(self.channel) > 0:
            print()
            


class Message:
    id = 0000
    emoji = ''
    rol = ''

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def showInstance(self):
        print(f'id: {self.id}\n Emoji: {self.Emoji}\n Rol: {self.Rol}')

    