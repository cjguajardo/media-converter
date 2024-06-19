import { getFrameDimensions } from '../utils/ffjpeg.js'
import { expect, test } from 'vitest'

const images = {
  horizontal_1280x720: [
    'tests/cgc-watermark-horizontal-1280x720.png',
    'tests/redmin-watermark-horizontal-1280x720.png',
  ],
  vertical_360x480: [
    'tests/1-vertical-360x480.jpg',
  ],
  vertical_1080x1920: [
    'tests/1-vertical-1080x1920.jpg',
  ],
}

test('getFrameDimensions should return 1280x720', async () => {
  const dimensions = await getFrameDimensions(images.horizontal_1280x720[0])
  expect(dimensions).toMatchObject({ width: 1280, height: 720 })

  const dimensions2 = await getFrameDimensions(images.horizontal_1280x720[1])
  expect(dimensions2).toMatchObject({ width: 1280, height: 720 })
})

test('getFrameDimensions should return 360x480', async () => {
  const dimensions = await getFrameDimensions(images.vertical_360x480[0])
  expect(dimensions).toMatchObject({ width: 360, height: 480 })
})

test('getFrameDimensions should return 1080x1920', async () => {
  const dimensions = await getFrameDimensions(images.vertical_1080x1920[0])
  expect(dimensions).toMatchObject({ width: 1080, height: 1920 })
})

test('getFrameDimensions should throws error when file does not exists', async () => {
  expect(getFrameDimensions('tests/does-not-exist.jpg')).rejects.toThrow()
})

test('getFrameDimensions should be undefined when filePath is not provided', async () => {
  expect(getFrameDimensions()).rejects.toThrow()
})