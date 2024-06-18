import Calipers from 'calipers'

export const getFrameDimensions = async (filePath) => {
  return new Promise((resolve, _) => {
    Calipers('jpeg').measure(filePath, function (err, result) {
      if (err) {
        console.error(err)
        resolve(null)
      } else {
        resolve(result.pages[0])
      }
    })
  })
}

// getFrameDimensions('/app/tmp/1898c3909f6756a2cffa90ad8638f6e8_frame_000002.jpg')
//   .then(dimes => console.log(dimes))