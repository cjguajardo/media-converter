package main

import (
	"fmt"

	ffmpeg "github.com/u2takey/ffmpeg-go"
)

func main() {
  err:=ffmpeg.Input("/source/video.webm").Output("/output/video.mp4", ffmpeg.KwArgs{"c:v":"libx265"}).OverWriteOutput().ErrorToStdOut().Run()

  if err!=nil{
    fmt.Println(err)
  }

}
