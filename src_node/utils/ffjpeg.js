import { constants, access } from "node:fs/promises"
import { readFileSync } from "node:fs"
import sizeOf from "buffer-image-size"

export const getFrameDimensions = (filePath) => {
  console.log(filePath)
  return new Promise(async (resolve, reject) => {
    try {
      if (!filePath) reject('filePath is required')
      const full_path = `/app/${filePath}`

      try {
        await access(full_path, constants.F_OK)
        const buffer = readFileSync(full_path)
        const dimensions = sizeOf(buffer)
        resolve(dimensions)
      } catch (err) {
        reject(err)
      }
    } catch (err) {
      console.log(err)
      reject(err)
    }
  })
}

// getFrameDimensions('/app/tmp/1898c3909f6756a2cffa90ad8638f6e8_frame_000002.jpg')
//   .then(dimes => console.log(dimes))