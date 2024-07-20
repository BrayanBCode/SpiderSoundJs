from discord.ext import commands
from pathlib import Path

class Handler:

    @staticmethod
    def getHandlers():
        print("Loading handlers...")
        events = Handler.loadEvents()
        commands = Handler.loadCommands()
        return events, commands

    @staticmethod
    def loadEvents():
        event_paths = []
        print("-- Loading events...")
        paths = Path("src/events")
        try:
            for filepath in paths.rglob("**/*.py"):
                if filepath.is_file():
                    # Obtener la ruta alternativa
                    alternative_path = str(filepath.relative_to(paths)).replace("\\", ".")
                    alternative_path = alternative_path.replace(".py", "")
                    alternative_path = "events." + alternative_path
                    event_paths.append(alternative_path)
            return event_paths
        except Exception as e:
            print(e)
            return
    
    @staticmethod
    def loadCommands():
        event_paths = []
        print("-- Loading commands...")
        paths = Path("src/commands")
        try:
            for filepath in paths.rglob("**/*.py"):
                if filepath.is_file():
                    # Obtener la ruta alternativa
                    alternative_path = str(filepath.relative_to(paths)).replace("\\", ".")
                    alternative_path = alternative_path.replace(".py", "")
                    alternative_path = "commands." + alternative_path
                    event_paths.append(alternative_path)
            return event_paths        
        except Exception as e:
                print(e)
                return