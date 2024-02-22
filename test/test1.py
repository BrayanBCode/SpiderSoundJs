import re

def contiene_id_youtube(cadena):
    # Patrón de expresión regular para encontrar identificadores de videos de YouTube
    patron_youtube = re.compile(r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})')

    # Buscar coincidencias en la cadena
    coincidencias = patron_youtube.findall(cadena)

    # Devolver True si se encontró al menos una coincidencia, de lo contrario, False
    return bool(coincidencias)

# Ejemplo de uso
cadena1 = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
cadena2 = "Este es un texto sin enlaces de YouTube."

#print(contiene_id_youtube(cadena1))  # True
#print(contiene_id_youtube(cadena2))  # False

# ---------------------------------------------------------

import re

def contiene_id_youtube(cadena):
    # Patrón regex para buscar un identificador de YouTube
    patron_youtube = re.compile(r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})')

    # Buscar el patrón en la cadena
    coincidencias = patron_youtube.search(cadena)

    # Si se encuentra una coincidencia, devolver el identificador, de lo contrario, devolver None
    return bool(coincidencias)

# Ejemplos de uso:
cadena1 = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
cadena2 = "https://youtu.be/dQw4w9WgXcQ"
cadena3 = "Texto sin ID de YouTube"

id_video1 = contiene_id_youtube(cadena1)
id_video2 = contiene_id_youtube(cadena2)
id_video3 = contiene_id_youtube(cadena3)

print("video 1:", id_video1)
print("video 2:", id_video2)
print("video 3:", id_video3)

# ---------------------------------------------------------

import re

def contiene_id_playlist_youtube(cadena):
    # Patrón regex para buscar un identificador de playlist de YouTube
    patron_playlist = re.compile(r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:playlist(?:s)?)\/|\S*?[?&]list=)|youtu\.be\/)([a-zA-Z0-9_-]+)')

    # Buscar el patrón en la cadena
    coincidencias = patron_playlist.search(cadena)

    # Si se encuentra una coincidencia, devolver el identificador, de lo contrario, devolver None
    return bool(coincidencias)

# Ejemplos de uso:
cadena1 = "https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG"
cadena2 = "https://youtu.be/PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG"
cadena3 = "Texto sin ID de Playlist de YouTube"

id_playlist1 = contiene_id_playlist_youtube(cadena1)
id_playlist2 = contiene_id_playlist_youtube(cadena2)
id_playlist3 = contiene_id_playlist_youtube(cadena3)

print("ID de la Playlist 1:", id_playlist1)
print("ID de la Playlist 2:", id_playlist2)
print("ID de la Playlist 3:", id_playlist3)



