FROM node:20

RUN apt-get update && apt-get install -y \
    ghostscript \
    graphicsmagick \
    python3 \
    make \
    g++

WORKDIR /app

COPY . .

COPY package.json yarn.lock ./

RUN yarn

RUN yarn migrate up

RUN yarn build

CMD ["node", "build/index.js"]
