import os
from pathlib import Path

from colorama import Fore


class Handler:

    @staticmethod
    def getHandlers():
        print(f"{Fore.CYAN}[info] Loading handlers...")
        events = Handler.loadCogs("events")
        commands = Handler.loadCogs("commands")
        return events, commands

    @staticmethod
    def loadCogs(carpetName: str):
        event_paths = []
        print(f"{Fore.CYAN}[info] Loading {carpetName}")
        root_path = Path(str(os.getcwd()))  # Ajusta esta ruta
        events_folder = Handler.find_folder(root_path, carpetName)
        if events_folder is None:
            print(f"{Fore.RED}[Error] Folder '{carpetName}' not found.")
            return event_paths
        try:
            for filepath in events_folder.rglob("**/*.py"):
                if filepath.is_file():
                    # Obtener la ruta alternativa
                    alternative_path = ".".join(
                        filepath.relative_to(events_folder).parts
                    ).replace(".py", "")
                    alternative_path = f"{carpetName}." + alternative_path
                    event_paths.append(alternative_path)
            return event_paths
        except Exception as e:
            print(e)
            return

    def find_folder(root_path, folder_name):
        for path in root_path.rglob(folder_name):
            if path.is_dir():
                return path
        return None
