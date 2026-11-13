FROM node:23-slim
WORKDIR /usr/src/app

COPY package*.json ./  

RUN npm install             

COPY ./dist .             

CMD ["node", "dist/shards.js"] 