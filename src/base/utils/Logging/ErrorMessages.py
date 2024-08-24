from colorama import Fore
from base.utils.Logging.logger import logger
from base.utils.Logging.warnings import warnings


class LogError(logger):
    def __init__(self, title: str, message: str):
        super().__init__(title, message, Fore.RED, warnings.Error.value)

class LogAviso(logger):
    def __init__(self, title: str, message: str):
        super().__init__(title, message, Fore.YELLOW, warnings.Aviso.value)

class LogExitoso(logger):
    def __init__(self, title: str, message: str):
        super().__init__(title, message, Fore.GREEN, warnings.Exitoso.value)

class LogInfo(logger):
    def __init__(self, title: str, message: str):
        super().__init__(title, message, Fore.CYAN, warnings.Info.value)

class LogDebug(logger):
    def __init__(self, title: str, message: str):
        super().__init__(title, message, Fore.MAGENTA, warnings.Debug.value)


