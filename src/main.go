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
		// download the file
		localFile, err := downloadFile(url)
		if err != nil {
			fmt.Println("Error downloading file: ", err)
		} else {
			if strings.Contains(url, ".audio.") {
				convertedFile := fmt.Sprintf("output/%s.mp3", strings.Split(localFile, ".")[0])
				out, err := os.Create(convertedFile)
				if err != nil {
					fmt.Println("Error creating the file:", err)
				} else {
					defer out.Close()
					fmt.Println("Audio file detected")
					command := fmt.Sprintf("/usr/bin/ffmpeg -i %s -vn -c:a libmp3lame -q:a 2 %s", localFile, convertedFile)
					cmd := exec.Command(command)
					if err := cmd.Run(); err == nil {
						fmt.Println("File converted: ", convertedFile)
					} else {
						fmt.Println("Error converting file: ", err)
					}
				}
			} else {
				fmt.Println("Audio file not detected")
			}
		}
	}

}

func downloadFile(url string) (string, error) {
	fmt.Println("Downloading file: ", url)
	response, err := http.Get(url)
	if err != nil {
		fmt.Println("Error downloading file: ", err)
		return "", err
	}

	defer response.Body.Close()

	// get file name
	parts := strings.Split(url, "/")
	localFile := parts[len(parts)-1]
	// Create the file
	out, err := os.Create(localFile)
	if err != nil {
		fmt.Println("Error creating the file:", err)
		return "", err
	}
	defer out.Close()

	// Copy the content from the HTTP response to the file
	_, err = io.Copy(out, response.Body)
	if err != nil {
		fmt.Println("Error copying content to file:", err)
		return "", err
	}

	return localFile, nil
}
