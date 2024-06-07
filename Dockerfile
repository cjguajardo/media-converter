# FROM alpine:edge
FROM node:current-alpine3.19

# install ffmpeg
RUN apk update && apk add ffmpeg curl bash
RUN npm install -g npm@10.8.1

# install golang
# RUN apk add go

WORKDIR /app
# Set the default command to execute when the container starts
CMD ["node index.js"]
# CMD ["go", "run", "main.go"]
