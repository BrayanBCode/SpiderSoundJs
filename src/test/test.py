import traceback
from base.utils.Logging.ErrorMessages import *


tetes = LogExitoso(title="Hola", message="Mundo").send()
tetes = LogAviso(title="Hola", message="Mundo").send()
tetes = LogError(title="Hola", message="Mundo").send()
tetes = LogInfo(title="Hola", message="Mundo").send()

try:
    raise Exception("Hola")
except Exception as e:
    LogError(title="Hola", message="Mundo").log(e, traceback)