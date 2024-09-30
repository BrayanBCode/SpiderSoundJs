from types import NoneType


class simpleTools:

    @staticmethod
    def formatTime(seconds: float) -> str:

        if seconds is None:
            return "liveStream 🔴"

        # Convertir el float en un entero de segundos
        seconds = int(seconds)

        # Calcular horas, minutos y segundos
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        seconds = seconds % 60

        # Construir el formato sin los ceros innecesarios
        if hours > 0:
            return f"{hours}:{minutes:02}:{seconds:02}"
        elif minutes > 0:
            return f"{minutes}:{seconds:02}"
        else:
            return f"{seconds}"
