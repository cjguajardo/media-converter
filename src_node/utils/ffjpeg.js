import { constants, access } from "node:fs/promises"
import { readFileSync } from "node:fs"
import sizeOf from "buffer-image-size"
import { chromium } from 'playwright'
import sharp from 'sharp'
import { fileTypeFromBuffer } from 'file-type'

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

const MOBILE_USER_AGENT = 'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36'
const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Safari/537.36'
export const webToImg = async (url, mobile = false) => {
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const context = await browser.newContext({
    viewport: {
      width: mobile ? 430 : 1920,
      height: mobile ? 932 : 1080
    },
    deviceScaleFactor: mobile ? 2 : 1,
  })

  const page = await context.newPage({
    isMobile: mobile,
    hasTouch: mobile,
    screen: {
      width: mobile ? 430 : 1920,
      height: mobile ? 932 : 1080
    },
    deviceScaleFactor: 1,
    userAgent: mobile ? MOBILE_USER_AGENT : DESKTOP_USER_AGENT
  })
  await page.goto(url, { waitUntil: 'networkidle' })
  const screenshot = await page.screenshot({
    fullPage: true, type: 'jpeg', quality: 80
  })
  await browser.close()

  // return 'data:image/jpeg;base64,' + screenshot.toString('base64')
  return screenshot
}

/**
 * 
 * @param {*} Buffer The image buffer to compress
 * @param {*} options The options for compression
 * @param {*} options.quality The quality of the image
 * @param {*} options.outputMimeType The output mime type
 * @param {*} options.maxWidth The maximum width of the image
 * @param {*} options.maxHeight The maximum height of the image
 * 
 * @returns Buffer
 */
export const compressImage = async (Buffer, options) => {
  const quality = options.quality || 80
  const outputMimeType = options.outputMimeType || 'image/jpeg'
  const maxWidth = options.maxWidth || null
  const maxHeight = options.maxHeight || null

  const sharpImage = sharp(Buffer)
  if (maxWidth && maxHeight) {
    sharpImage.resize(maxWidth, maxHeight)
  } else {
    const dimensions = sizeOf(Buffer)
    // get current aspect ratio
    const aspectRatio = dimensions.width / dimensions.height
    if (maxWidth) {
      sharpImage.resize(maxWidth, Math.floor(maxWidth / aspectRatio))
    }
    if (maxHeight) {
      sharpImage.resize(Math.floor(maxHeight * aspectRatio), maxHeight)
    }
  }

  switch (outputMimeType) {
    case 'image/jpeg':
      sharpImage.jpeg({ quality }); break
    case 'image/png':
      sharpImage.png({ quality }); break
    case 'image/webp':
      sharpImage.webp({ quality }); break
    default:
      sharpImage.jpeg({ quality }); break
  }
  return sharpImage.toBuffer()
}

export async function getMimeType (buffer) {
  const fileType = await fileTypeFromBuffer(buffer)

  if (fileType) {
    return fileType.mime
  }
  return 'image/jpeg'
}
// getFrameDimensions('/app/tmp/1898c3909f6756a2cffa90ad8638f6e8_frame_000002.jpg')
//   .then(dimes => console.log(dimes))