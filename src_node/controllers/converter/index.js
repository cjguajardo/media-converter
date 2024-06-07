import * as ffmpeg from '../../utils/ffmpeg.js'
import { upload } from '../../utils/s3.js'
import { readFileSync } from 'node:fs'
import { unlink } from 'node:fs/promises'
import downloader from '../../utils/downloader.js'

export default {
  auto: async (req, res) => {
    try {
      const file = req.file
      let path = req.body.path || null
      let output = req.body.output || 'same'
      const post_convert = req.body.post_convert_output || 'upload'
      const overlay_image_url = req.body.overlay_image_url || null

      if (!file) {
        return res.status(400).json({ message: 'You must append a file' })
      }

      const mimeType = file.mimetype
      const [fileType, _] = mimeType.split('/')

      if (fileType !== 'audio' && fileType !== 'video') {
        return res.status(400).json({ message: 'Invalid file type' })
      }

      if (['same', 'video', 'audio'].indexOf(output.toLowerCase()) == -1) {
        return res.status(400).json({ message: 'Invalid output option' })
      }

      if (['stream', 'upload'].indexOf(post_convert.toLowerCase()) == -1) {
        return res
          .status(400)
          .json({ message: 'Invalid post_convert_output option' })
      }

      if (overlay_image_url) {
        if (overlay_image_url.indexOf('.png') == -1) {
          return res.status(400).json({
            message: 'Invalid overlay image format. You must use a PNG image.',
          })
        }
      }

      if (path != null) {
        if (path.charAt(path.length - 1) != '/') {
          path = `${path}/`
        }
        if (path.charAt(0) == '/') {
          path = path.substring(1)
        }
      }

      if (output === 'same') {
        output = fileType
      }
      output = output.toLowerCase()
      let args = []
      let ext = ''
      const paths_for_cleanup = []

      switch (output.toLowerCase()) {
        case 'video':
          args = ffmpeg.getBasicVideoParams(file.path)
          ext = 'mp4'
          break
        case 'audio':
          args = ffmpeg.getBasicAudioParams(file.path)
          ext = 'mp3'
          break
      }

      const response = {}
      console.log({ path, output, fileType, overlay_image_url, post_convert })

      const output_path = `tmp/${file.filename}.${ext}`
      paths_for_cleanup.push(output_path)
      if (overlay_image_url && output === 'video') {
        response.watermark = `tmp/${file.filename}_watermark.png`

        const result = await downloader(overlay_image_url, response.watermark)
        if (!result) {
          delete response.watermark
        }
      }

      ffmpeg.convert(output_path, args)
      if (response.watermark) {
        response.watermarked = ffmpeg.putWatermark(
          output_path,
          response.watermark
        )
        paths_for_cleanup.push(response.watermark)
      }
      const duration = ffmpeg.getDuration(output_path)

      response.duration = duration
      // response.f = file;

      if (fileType === 'video' && output === fileType) {
        const video_frame_path = ffmpeg.getVideoFrame(output_path, '00:00:01')
        paths_for_cleanup.push(video_frame_path)
        const video_dimensions = ffmpeg.getVideoDimensions(file.path)
        response.frame = video_frame_path
        response.dimentions = video_dimensions
        if (video_dimensions.width > video_dimensions.height) {
          response.orientation = 'landscape'
        } else {
          response.orientation = 'portrait'
        }
      }

      if (output === 'video') {
        if (fileType === 'video') {
          const mode = response.orientation === 'landscape' ? 'h' : 'v'
          response.filename = `${file.filename}-${duration}s-${mode}.mp4`
        } else {
          response.filename = `${file.filename}-${duration}s-h.mp4`
        }
      } else {
        response.filename = `${file.filename}-${duration}s.mp3`
      }

      let fileContent = null
      if (overlay_image_url) {
        fileContent = readFileSync(response.watermarked)
      } else {
        fileContent = readFileSync(output_path)
      }
      if (post_convert === 'upload') {
        const folder = path ? path : process.env.AWS_BUCKET_PATH || ''
        const destFileName = `${folder}${response.filename}`

        const resp1 = await upload({ destFileName, fileContent })
        console.log({ resp1 })
        if (resp1) {
          response.file = resp1.url
        }
        if (response.frame) {
          const frameContent = readFileSync(response.frame)
          const destFrameName = `${folder}${response.frame.replace('tmp/', '')}`
          const resp2 = await upload({
            destFileName: destFrameName,
            fileContent: frameContent,
          })
          console.log({ resp2 })
          if (resp2) {
            response.frame = resp2.url
          }
        }
      } else {
        const mimeType = output === 'video' ? 'video/mp4' : 'audio/mp3'
        response.file =
          `data:${mimeType};base64,` + fileContent.toString('base64')

        if (response.frame) {
          const frameContent = readFileSync(response.frame)
          response.frame =
            'data:image/jpg;base64,' + frameContent.toString('base64')
        }
      }

      // cleanup
      for (let p of paths_for_cleanup) {
        console.log('Removing: ', p)
        unlink(p)
      }
      delete response.watermarked
      delete response.watermark
      delete response.filename

      console.log('Done!')

      return res.send(response)
    } catch (ex) {
      console.error({ ex })
      return res.status(500).json({ message: ex.message })
    }
  },
}
