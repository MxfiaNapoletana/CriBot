FROM node:20

WORKDIR /app

COPY package*.json ./

CMD node main.js || node .