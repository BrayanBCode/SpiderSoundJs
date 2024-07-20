import os
from colorama import Fore
from discord.ext import commands
from pathlib import Path

class Handler:

    @staticmethod
    def getHandlers():
        print(f"{Fore.CYAN}[info] Loading handlers...")
        events = Handler.loadEvents()
        commands = Handler.loadCommands()
        return events, commands

    @staticmethod
    def loadEvents():
        event_paths = []
        print(f"{Fore.CYAN}[info] Loading events")
        root_path = Path(str(os.getcwd()))  # Ajusta esta ruta
        # print(f"{Fore.YELLOW}[Debug] {root_path}")
        events_folder = Handler.find_folder(root_path, "events")
        if events_folder is None:
            print(f"{Fore.RED}[Error] Folder 'events' not found.")
            return event_paths
        try:
            for filepath in events_folder.rglob("**/*.py"):
                if filepath.is_file():
                    # Obtener la ruta alternativa
                    alternative_path = ".".join(filepath.relative_to(events_folder).parts).replace(".py", "")
                    alternative_path = "events." + alternative_path
                    # print(f"{Fore.YELLOW}[Debug] {alternative_path}")
                    event_paths.append(alternative_path)
            return event_paths
        except Exception as e:
            print(e)
            return
    
    @staticmethod
    def loadCommands():
        commands_paths = []
        print(f"{Fore.CYAN}[info] Loading commands")
        root_path = Path(str(os.getcwd()))  # Ajusta esta ruta
        # print(f"{Fore.YELLOW}[Debug] {root_path}")
        commands_folder = Handler.find_folder(root_path, "commands")
        if commands_folder is None:
            print(f"{Fore.RED}[Error] Folder 'commands' not found.")
            return commands_paths
        try:
            for filepath in commands_folder.rglob("**/*.py"):
                if filepath.is_file():
                    # Obtener la ruta alternativa
                    alternative_path = ".".join(filepath.relative_to(commands_folder).parts).replace(".py", "")
                    alternative_path = "commands." + alternative_path
                    # print(f"{Fore.YELLOW}[Debug] {alternative_path}")
                    commands_paths.append(alternative_path)
            return commands_paths
        except Exception as e:
            print(e)
            return

    def find_folder(root_path, folder_name):
        for path in root_path.rglob(folder_name):
            if path.is_dir():
                return path
        return None
            

        