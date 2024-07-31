
from base.classes.Bot import CustomBot
import dotenv, os

dotenv.load_dotenv()

# os.getenv("debug")

if __name__ == "__main__":
    bot = CustomBot(command_prefix="=", debug=False)