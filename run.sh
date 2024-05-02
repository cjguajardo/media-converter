docker run \
-v $PWD/src/output/:/app/output/ \
web-to-mp4-go-webm-to-mp4 \
ffmpeg -loglevel fatal \
-i https://rie2024.s3.amazonaws.com/v_171451217944876379.audio.webm \
-c:a libmp3lame output/v_171451217944876379.audio.mp3 -y


