FROM node:20

WORKDIR /usr/app/src

COPY package.json ./
COPY yarn.lock ./
COPY .env ./

RUN yarn install

COPY . .

EXPOSE 8080

CMD ["yarn", "start"]