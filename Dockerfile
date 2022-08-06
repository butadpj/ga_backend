FROM node:16-alpine

ENV NODE_ENV development

WORKDIR /my-app

COPY package*.json ./

RUN npm install

COPY . ./

EXPOSE 4000

CMD ["npm", "run", "start:dev"]

