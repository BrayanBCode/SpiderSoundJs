FROM node:23-slim
WORKDIR /usr/src/app

COPY package*.json ./  

RUN npm install        
RUN npm install -g tsx        

COPY . .             

CMD ["tsx", "./src/index.ts"] 