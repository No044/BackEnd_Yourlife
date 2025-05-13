FROM node:22 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

FROM node:alpine

WORKDIR /app

COPY --from=build /app .

CMD ["node", "index.js"]