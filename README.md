Bot de pruebas: https://discord.com/oauth2/authorize?client_id=1114600638043660288&permissions=8&scope=bot+applications.commands

with open("output.txt", "w", encoding="utf8") as file:
    file.write(json.dumps(info, indent=4))  # Convertimos el diccionario a una cadena JSON para escribirlo en el archivo