FROM node:20

WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get install -y ghostscript graphicsmagick && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 8080

CMD ["yarn", "start"]
