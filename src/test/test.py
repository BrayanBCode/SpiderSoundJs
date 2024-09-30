import traceback

from base.utils.Logging.LogMessages import *

tetes = LogExitoso(title="Hola", message="Mundo").print()
tetes = LogAviso(title="Hola", message="Mundo").print()
tetes = LogError(title="Hola", message="Mundo").print()
tetes = LogInfo(title="Hola", message="Mundo").print()

try:
    raise Exception("Hola")
except Exception as e:
    LogError(title="Hola", message="Mundo").log(e)
