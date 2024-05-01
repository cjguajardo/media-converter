FROM amazonlinux:2023

# RUN apk update && apk add ffmpeg

# install golang
RUN yum install -y golang

# Set the default command to execute when the container starts
# CMD ["/bin/bash"]
CMD ["go", "run", "main.go"]
