import sys
import os

# Añadir el directorio raíz del proyecto al PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from Search_handler import searchModule
from utils.config import ConfigMediaSearch

config = ConfigMediaSearch.default()
print(config)
search = "https://www.youtube.com/watch?v=AhZvCgk1Ay4"

print(searchModule(ctx=None, search=search, config=config))

