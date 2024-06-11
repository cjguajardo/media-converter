# FROM alpine:edge
FROM node:22

# install ffmpeg
# RUN apk update && apk add ffmpeg curl bash
RUN apt-get update && apt-get install -y ffmpeg curl bash
RUN npm install -g npm@10.8.1

# install golang
# RUN apk add go

WORKDIR /app

COPY src_node/dist /app
COPY src_node/html /app/html
RUN mkdir /app/tmp
# COPY src_node /app_src
# COPY deps-install.sh /app

# Set the default command to execute when the container starts
CMD ["node", "/app/server.js"]
# CMD ["go", "run", "main.go"]
