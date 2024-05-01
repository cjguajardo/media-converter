FROM alpine:edge

# install ffmpeg
RUN apk update && apk add ffmpeg

# install golang
RUN apk add go

# install golang
# RUN yum install -y golang

#install ffmpeg
# RUN yum install -y epel-release

WORKDIR /app
# Set the default command to execute when the container starts
# CMD ["/bin/bash"]
CMD ["go", "run", "main.go"]
