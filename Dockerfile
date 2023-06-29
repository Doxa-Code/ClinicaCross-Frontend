FROM node:alpine
WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app
COPY .next .next
COPY public public
COPY next.config.js next.config.js

RUN yarn install --production

EXPOSE 3000
CMD [ "npm", "run", "start" ]

