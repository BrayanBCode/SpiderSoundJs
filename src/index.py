
from base.classes.Bot import CustomBot
import dotenv, os, signal, sys

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
    # Registra el manejador de señales para SIGINT
    signal.signal(signal.SIGINT, signal_handler)

    # Inicializa y ejecuta el bot
    bot = CustomBot(command_prefix="=", debug=False)
