package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"
)

func main() {
	// check if output directory exists
	if _, err := os.Stat("/app/output/"); os.IsNotExist(err) {
		os.Mkdir("/app/output", 0777)
	}

	if _, err := os.Stat("/app/source/"); os.IsNotExist(err) {
		os.Mkdir("/app/source", 0777)
	}
	urls := []string{
		"https://rie2024.s3.amazonaws.com/v_171449606899803791.video.webm",
		"https://rie2024.s3.amazonaws.com/v_171449559339918922.audio.webm",
		"https://rie2024.s3.amazonaws.com/v_171451217944876379.audio.webm",
		"https://rie2024.s3.amazonaws.com/v_171451279675620993.audio.webm",
		"https://rie2024.s3.amazonaws.com/v_171451781128567964.audio.webm",
	}

	for _, url := range urls {
		fileName := getFileName(url)
		response, err := http.Get(url)
		if err == nil {
			defer response.Body.Close()
			// Download to source/
			f, err := os.Create("source/" + fileName)
			if err != nil {
				fmt.Println(err)
				return
			}
			defer f.Close()

			_, err = io.Copy(f, response.Body)
			if err != nil {
				fmt.Println(err)
			}
		} else {
			fmt.Println("Error", err)
		}

		destFile := ""
		if strings.Contains(url, ".audio.") {
			destFile = strings.ReplaceAll(fileName, ".webm", ".mp3")
		} else {
			destFile = strings.ReplaceAll(fileName, ".webm", ".mp4")
		}

		if destFile != "" {
			destFile = "output/" + destFile
			out, err := os.Create(destFile)
			if err != nil {
				fmt.Println("Error creating the file:", err)
			}
			defer out.Close()

			convert(url, destFile)
		}
	}
}

func convert(sourceFile string, destFile string) {
	params := " "
	if strings.Index(destFile, ".mp4") != -1 {
		params = " -c:v libx264 -q:v 15 "
	}
	args := fmt.Sprintf("-i %s -c:a libmp3lame%s%s -y", sourceFile, params, destFile)
	fmt.Println("Converting file: ", args)

	cmd := exec.Command("/usr/bin/ffmpeg", "-loglevel", "fatal", args)
	_, err := cmd.StdoutPipe()
	if err != nil {
		fmt.Println("Error converting file: ", err)
	}
	if err := cmd.Start(); err != nil {
		fmt.Println("Error converting file: ", err)
	}
	err = cmd.Wait()
	if err != nil {
		fmt.Println("Error converting file: ", err)
	}
}

func getFileName(url string) string {
	// get file name
	parts := strings.Split(url, "/")
	fileName := parts[len(parts)-1]

	return fileName
}
