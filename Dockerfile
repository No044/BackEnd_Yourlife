FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

CMD ["npm", "run", "build"]