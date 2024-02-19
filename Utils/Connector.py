# db_connector.py

import mysql.connector

def connect_to_database():
  try:
    connection = mysql.connector.connect(
      host="localhost",  # Cambia esto al host correcto
      user="tu_usuario",  # Cambia esto al usuario correcto
      password="tu_contraseña",  # Cambia esto a la contraseña correcta
      database="nombre_de_la_base_de_datos"  # Cambia esto al nombre de tu base de datos
      )
    return connection
  except mysql.connector.Error as err:
    print(f"Error al conectar a la base de datos: {err}")
    return None
