async function main () {
  const buttonStart = document.querySelector('#buttonStart')
  const buttonStop = document.querySelector('#buttonStop')
  const videoLive = document.querySelector('#videoLive')
  const videoRecorded = document.querySelector('#videoRecorded')

  const stream = await navigator.mediaDevices.getUserMedia({ // <1>
    video: true,
    audio: true,
  })

  videoLive.srcObject = stream

  const types = [
    "video/webm",
    "audio/webm",
    "audio/mpeg",
    "audio/ogg;codecs=vorbis",
    "video/webm;codecs=vp8",
    "video/webm;codecs=daala",
    "video/webm;codecs=h264",
    "audio/webm;codecs=opus",
    "video/mp4",
  ];

  for (const type of types) {
    console.log(
      `Is ${type} supported? ${
        MediaRecorder.isTypeSupported(type) ? "Maybe!" : "Nope :("
      }`,
    );
  }

  const mediaRecorder = new MediaRecorder(stream, { // <3>
    mimeType: 'video/webm',
  })

  buttonStart.addEventListener('click', () => {
    mediaRecorder.start() // <4>
    buttonStart.setAttribute('disabled', '')
    buttonStop.removeAttribute('disabled')
  })

  buttonStop.addEventListener('click', () => {
    mediaRecorder.stop() // <5>
    buttonStart.removeAttribute('disabled')
    buttonStop.setAttribute('disabled', '')
  })

  mediaRecorder.addEventListener('dataavailable', event => {
    videoRecorded.src = URL.createObjectURL(event.data) // <6>
  })
}

main()
