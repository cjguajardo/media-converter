async function main () {
  console.log('main')
  const token = sessionStorage.getItem('token')
  if (token === null || token == '') {
    window.location.href = '/demo/login'
    return
  }
  try {
    const buttonStart = document.querySelector('#buttonStart')
    const buttonStop = document.querySelector('#buttonStop')
    const videoLive = document.querySelector('#videoLive')
    const videoRecorded = document.querySelector('#videoRecorded')
    const timeDisplay = document.querySelector('#timeDisplay')
    if (buttonStart) buttonStart.classList.remove('hidden')
    if (buttonStop) buttonStop.classList.remove('hidden')
    console.log({ object: { buttonStart, buttonStop, videoLive, videoRecorded, timeDisplay } })

    const devices = (
      await navigator.mediaDevices.enumerateDevices()
    ).filter((device) => {
      console.log(device)
      return device.label.indexOf('Epoc') !== -1
    })
    console.log({ devices })

    const audioDeviceId = devices.filter(
      (device) => device.kind === 'audioinput'
    )[0]?.deviceId
    const videoDeviceId = devices.filter(
      (device) => device.kind === 'videoinput'
    )[0]?.deviceId
    console.log({ audioDeviceId, videoDeviceId })

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: videoDeviceId },
      audio: { deviceId: audioDeviceId },
    })

    videoLive.srcObject = stream

    const types = ['video/webm', 'video/mp4']

    let supportedMime = ''
    let supportedExt = ''
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        supportedMime = type
        if (type === 'video/webm') {
          supportedExt = 'webm'
        } else if (type === 'video/mp4') {
          supportedExt = 'mp4'
        }
        break
      }
    }
    console.log({ mime: supportedMime, ext: supportedExt })
    const options = {
      mimeType: supportedMime,
    }
    const mediaRecorder = new MediaRecorder(stream, options)

    const video_preview = document.querySelector('#video_preview')
    const video_output = document.querySelector('#video_output')

    buttonStart.addEventListener('click', () => {
      console.log('Start')
      timeDisplay.textContent = '00:00'
      mediaRecorder.start()
      startTimer(timeDisplay)
      buttonStart.setAttribute('disabled', '')
      buttonStop.removeAttribute('disabled')
      if (video_preview) {
        video_preview.style.display = 'block'
      }
      if (video_output) {
        video_output.style.display = 'none'
      }
    })

    buttonStop.addEventListener('click', () => {
      console.log('Stop')
      mediaRecorder.stop()
      buttonStart.removeAttribute('disabled')
      buttonStop.setAttribute('disabled', '')
      if (video_preview) {
        video_preview.style.display = 'none'
      }
      if (video_output) {
        video_output.style.display = 'block'
      }
      const timerInterval = sessionStorage.getItem('timerInterval')
      clearInterval(timerInterval)
      timeDisplay.textContent = '00:00'
    })

    mediaRecorder.addEventListener('dataavailable', (event) => {
      console.log('DATA AVAILABLE')
      if (supportedExt !== '' && supportedExt !== '') {
        videoRecorded.src = URL.createObjectURL(event.data)
        const downloadLink = document.querySelector('#downloadLink')
        downloadLink.href = videoRecorded.src
        const date = new Date()
        const fileName = `video-${date.toISOString()}`
        downloadLink.download = fileName
        // downloadLink.click()
        convertMedia(event.data)
        return
      }
    })
  } catch (error) {
    console.error(error)
  }
}

async function getDevices () {
  console.log('getDevices')
  navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
      console.log('devices', { devices })
    })
}

function startTimer (display) {
  let timer = 0
  let minutes = 0
  let seconds = 0
  const timerInterval = setInterval(() => {
    timer++
    minutes = Math.floor(timer / 60)
    seconds = timer % 60
    display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, 1000)

  sessionStorage.setItem('timerInterval', timerInterval)
}

function convertMedia (blobData) {
  const loader = document.querySelector('#loader')
  if (loader) {
    loader.style.display = 'flex'
  }
  const formdata = new FormData()
  formdata.append('file', blobData)
  formdata.append("path", "/test3")
  formdata.append("overlay_image_url", "https://cgcapps.cl/_other-assets/cgc-watermark.png")
  formdata.append("post_convert_output", "upload")

  const myHeaders = new Headers()
  const token = sessionStorage.getItem('token')
  myHeaders.append("Authorization", "Bearer " + token)

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow"
  }

  fetch("/convert", requestOptions)
    .then((response) => {
      if (!response.ok) {
        return response.text()
      } else {
        const responseType = response.headers.get('content-type')
        if (responseType.indexOf('application/json') !== -1) {
          return response.json()
        }
        return response.text()
      }
    })
    .then((result) => console.log(result))
    .catch((error) => console.error(error))
    .finally(() => {
      if (loader) {
        loader.style.display = 'none'
      }
    })
}
