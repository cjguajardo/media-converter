import * as ffmpeg from '../../utils/ffmpeg.js';
import * as ffjpeg from '../../utils/ffjpeg.js';
import {
  readFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
} from 'node:fs';
import { unlink } from 'node:fs/promises';
import downloader from '../../utils/downloader.js';
import * as fx from './functions.js';

export default {
  auto: async (req, res) => {
    try {
      const file = req.file;
      let path = req.body.path || null;
      let output = req.body.output || 'same';
      const post_convert = req.body.post_convert_output || 'upload';
      const overlay_image_url = req.body.overlay_image_url || null;

      if (!file) {
        return res.status(400).json({ message: 'You must append a file' });
      }

      const mimeType = file.mimetype;
      const [fileType, _] = mimeType.split('/');

      if (fileType !== 'audio' && fileType !== 'video') {
        return res.status(400).json({ message: 'Invalid file type' });
      }

      if (['same', 'video', 'audio'].indexOf(output.toLowerCase()) == -1) {
        return res.status(400).json({ message: 'Invalid output option' });
      }

      if (['stream', 'upload'].indexOf(post_convert.toLowerCase()) == -1) {
        return res
          .status(400)
          .json({ message: 'Invalid post_convert_output option' });
      }

      if (overlay_image_url) {
        if (overlay_image_url.indexOf('.png') == -1) {
          return res.status(400).json({
            message: 'Invalid overlay image format. You must use a PNG image.',
          });
        }
      }

      path = fx.checkPath(path);

      if (output === 'same') {
        output = fileType;
      }
      output = output.toLowerCase();
      let { args, ext } = fx.getConvertParams(file.path, output);
      const paths_for_cleanup = [];

      const response = {};
      console.log({ path, output, fileType, overlay_image_url, post_convert });

      const output_path = `tmp/${file.filename}.${ext}`;
      paths_for_cleanup.push(output_path);
      if (overlay_image_url && output === 'video') {
        response.watermark = `tmp/${file.filename}_watermark.png`;

        const result = await downloader(overlay_image_url, response.watermark);
        if (!result) {
          delete response.watermark;
        }
      }

      ffmpeg.convert(output_path, args);
      if (response.watermark) {
        response.watermarked = ffmpeg.putWatermark(
          output_path,
          response.watermark
        );
        paths_for_cleanup.push(response.watermark);
      }
      const duration = ffmpeg.getDuration(output_path);
      response.duration = duration;
      // response.f = file;

      if (fileType === 'video' && output === fileType) {
        const video_frame_path = ffmpeg.getVideoFrame(file.path, '00:00:01.25');
        paths_for_cleanup.push(video_frame_path);
        // const video_dimensions = ffmpeg.getVideoDimensions(file.path)
        const video_dimensions =
          await ffjpeg.getFrameDimensions(video_frame_path);
        console.log('Video dimensions: ', { video_dimensions });
        response.frame = video_frame_path;
        response.dimensions = video_dimensions;
        if (video_dimensions.width > video_dimensions.height) {
          response.orientation = 'landscape';
        } else {
          response.orientation = 'portrait';
        }
      }

      fx.setFileName(output, fileType, response, file.filename);

      let fileContent = null;
      if (overlay_image_url) {
        fileContent = readFileSync(response.watermarked);
      } else {
        fileContent = readFileSync(output_path);
      }

      const audioExists = ffmpeg.hasAudio(output_path);
      response.audio_video = audioExists;

      const textToAdd =
        '-vau' + (audioExists === true || audioExists === 1 ? '1' : '0');

      // Verificar si `textToAdd` ya está presente
      if (response.filename.includes(textToAdd)) {
        let index = response.filename.lastIndexOf('.mp4');
        // Insertar el texto justo antes de .mp4
        response.filename =
          response.filename.slice(0, index) +
          textToAdd +
          response.filename.slice(index);
      }

      await fx.postConvertActions(response, fileContent, {
        output,
        action: post_convert,
        path,
        output_path,
      });

      // cleanup
      for (let p of paths_for_cleanup) {
        console.log('Removing: ', p);
        unlink(p);
      }
      delete response.watermarked;
      delete response.watermark;
      delete response.filename;

      console.log('Done!');

      return res.send(response);
    } catch (ex) {
      console.error({ ex });
      return res.status(500).json({ message: ex.message });
    }
  },
  webToImg: async (req, res) => {
    try {
      const {
        url,
        returnAs,
        generateMobile,
        compress,
        quality,
        outputMime,
        maxWidth,
        maxHeight,
      } = req.body;
      if (!url) {
        return res.status(400).json({ message: 'You must provide a URL' });
      }
      const desktop = await ffjpeg.webToImg(url, false);
      const mobile = generateMobile ? await ffjpeg.webToImg(url, true) : null;

      const getReturnFormat = async img => {
        console.log('ENTRA', { img });
        let mime = 'image/jpeg';
        if (compress) {
          img = await ffjpeg.compressImage(img, {
            quality: quality || 80,
            outputMimeType: outputMime || 'image/jpeg',
            maxWidth,
            maxHeight,
          });
          mime = outputMime || 'image/jpeg';
        }
        console.log('SALE', { img });

        if (returnAs === 'base64') {
          // get mime type
          return `data:${mime};base64,${img.toString('base64')}`;
        }
        return img;
      };

      if (desktop && mobile) {
        return res.send({
          desktop: await getReturnFormat(desktop),
          mobile: await getReturnFormat(mobile),
        });
      } else {
        if (desktop) {
          return res.send({ desktop: await getReturnFormat(desktop) });
        }
        if (mobile) {
          return res.send({ mobile: await getReturnFormat(mobile) });
        }
      }
      return res
        .status(500)
        .json({ message: 'Failed to convert URL to image' });
    } catch (err) {
      console.error({ err });
      return res.status(500).json({ message: err.message });
    }
  },
  uploadChunk: async (req, res) => {
    const dirsToCleanup = [];
    try {
      const _max = req.body.max;
      const _index = req.body.index;
      const _chunk = req.body.chunk;
      const _id = req.body.id;
      const _crc = req.body.crc;

      const base_dir = '/app/tmp/chunks';
      dirsToCleanup.push(base_dir);
      // check if chunks base directory exists
      if (!existsSync(base_dir)) {
        mkdirSync(base_dir);
      }
      const dir = `${base_dir}/${_id}`;
      // check if chunk directory exists
      if (!existsSync(dir)) {
        mkdirSync(dir);
      }

      // write content to a text file into $dir
      const fname = `${_index}`.padStart(3, '0');
      const file_name = `${dir}/${fname}.txt`;
      writeFileSync(file_name, _chunk);

      // check if directory has all the files
      const files_in_dir = readdirSync(dir, { withFileTypes: true }).filter(
        value => value.isFile() && value.name.indexOf('.txt')
      );
      if (files_in_dir.length === _max) {
        const response = {};

        let base64_content = '';
        // 1. read all files content and merge to build the final file
        files_in_dir.forEach(fid => {
          const content = readFileSync(fid.parentPath + '/' + fid.name, {
            encoding: 'utf8',
            flag: 'r',
          });
          base64_content += content;
        });

        const crc_enabled = process.env.ENABLE_CRC;
        if (crc_enabled) {
          const base64_crc = fx.crc32(base64_content);
          if (base64_crc !== _crc) {
            console.log('CRC ERROR');
            return res.status(400).json({ message: 'CRC ERROR' });
          }
        }

        base64_content = base64_content.replaceAll('\n', '');
        // 2. turn base64 to file depending on base64 header
        const mime_type = base64_content.split(';')[0].split(':')[1] ?? 'none';
        if (mime_type === 'none') {
          return res.status(400).json({ message: 'Invalid base64 header' });
        }
        const output = mime_type.split('/')[0] ?? 'video';
        const new_extension = fx.getExtensionFromMimeType(mime_type);
        writeFileSync(
          `${dir}/output${new_extension}`,
          base64_content.split(';base64,')[1],
          {
            encoding: 'base64',
          }
        );
        // 3. convert the file with default options
        const { args, ext } = fx.getConvertParams(
          `${dir}/output${new_extension}`,
          output
        );

        const output_path = `/app/tmp/${_id}.${ext}`;
        ffmpeg.convert(output_path, args);
        dirsToCleanup.push(output_path);

        const duration = ffmpeg.getDuration(output_path);
        response.duration = duration;
        const fileContent = readFileSync(output_path);
        await fx.getDimensionsAndOrientation(
          output,
          output,
          output_path,
          response
        );

        fx.setFileName(output, output, response, _id);

        await fx.postConvertActions(response, fileContent, {
          output,
          action: 'upload',
          path: 'chunk-uploads/',
          output_path,
        });

        // cleanup
        fx.cleanup(dirsToCleanup);

        return res.send(response);
      } else {
        return res.send({ success: true });
      }
    } catch (ex) {
      console.error({ ex });
      fx.cleanup(dirsToCleanup);
      return res.status(500).json({ message: ex.message });
    }
  },
};
