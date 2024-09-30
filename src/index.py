import os
import signal
import sys

import dotenv

from base.classes.Bot import CustomBot

dotenv.load_dotenv()

# os.getenv("debug")


def restart_bot():
    """Reinicia el bot ejecutando el script de nuevo."""
    python = sys.executable
    os.execl(python, python, *sys.argv)


def signal_handler(sig, frame):
    """Maneja la señal SIGINT (Ctrl + C) y reinicia el bot."""
    print("Reiniciando el bot...")
    restart_bot()


if __name__ == "__main__":

    # signal.signal(signal.SIGINT, signal_handler)

    bot = CustomBot(command_prefix="=", debug=False)
