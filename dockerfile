# Usa una imagen base de Node.js versión 22
FROM node:22-slim

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia el package.json y el package-lock.json al directorio de trabajo
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install -g typescript
RUN npm install

# Copia los archivos del proyecto al directorio de trabajo
COPY . .

# Instala ts-node globalmente para ejecutar TypeScript directamente
# RUN npm install -g ts-node

# Expone el puerto en el que se ejecuta tu bot (si es necesario)
EXPOSE 3000

# Comando para ejecutar tu bot con ts-node
CMD ["npm", "run", "devstart"]
