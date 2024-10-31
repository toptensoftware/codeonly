FROM node:latest

ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && apt upgrade && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app/website
COPY client/dist ./client/dist/
COPY server ./server/
COPY package* ./
RUN npm install --omit=dev --loglevel verbose

EXPOSE 3000
ENTRYPOINT [ "/bin/sh", "-c" , "node ./server/server.js" ]
