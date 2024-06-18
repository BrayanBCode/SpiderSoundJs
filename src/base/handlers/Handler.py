from discord.ext import commands
from pathlib import Path

class Handler:

    @staticmethod
    def loadHandlers():
        print("Loading handlers...")
        events = Handler.loadEvents()
        commands = Handler.loadCommands()
        return events, commands

    @staticmethod
    def loadEvents():
        events = []
        print("Loading events...")
        paths = Path("src/events")
        for filepath in paths.rglob("*.py"):
            if filepath.is_file():
                relative_path = filepath.relative_to(paths)
                event = f"events.{relative_path.with_suffix('').stem}".replace("\\", ".")
                events.append(event)
        return events

    @staticmethod
    def loadCommands():
        commands = []
        print("Loading commands...")
        commands_path = Path("src/commands")
        for filepath in commands_path.rglob("*.py"):
            if filepath.is_file():
                relative_path = filepath.relative_to(commands_path)
                command = f"commands.{relative_path.with_suffix('').stem}".replace("\\", ".")
                commands.append(command)
        return commands