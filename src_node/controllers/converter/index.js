import * as ffmpeg from '../../utils/ffmpeg.js';
import * as ffjpeg from '../../utils/ffjpeg.js';
import { upload } from '../../utils/s3.js';
import {
  readFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  rmdir,
  lstatSync,
  readdirSync,
} from 'node:fs';
import { unlink } from 'node:fs/promises';
import downloader from '../../utils/downloader.js';

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

      if (path != null) {
        if (path.charAt(path.length - 1) != '/') {
          path = `${path}/`;
        }
        if (path.charAt(0) == '/') {
          path = path.substring(1);
        }
      }

      if (output === 'same') {
        output = fileType;
      }
      output = output.toLowerCase();
      let { args, ext } = getConvertParams(file.path, output);
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
        const video_frame_path = ffmpeg.getVideoFrame(output_path, '00:00:02');
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

      setFileName(output, fileType, response, file.filename);

      let fileContent = null;
      if (overlay_image_url) {
        fileContent = readFileSync(response.watermarked);
      } else {
        fileContent = readFileSync(output_path);
      }

      const audioExists = ffmpeg.hasAudio(output_path);
      response.audio_video = audioExists;

      let textToAdd = '-vau';
      if (audioExists === true || audioExists === 1) {
        textToAdd += '1';
      } else {
        textToAdd += '0';
      }

      // Verificar si `textToAdd` ya está presente
      if (response.filename.includes(textToAdd)) {
        let index = response.filename.lastIndexOf('.mp4');
        // Insertar el texto justo antes de .mp4
        response.filename =
          response.filename.slice(0, index) +
          textToAdd +
          response.filename.slice(index);
      }

      postConvertActions(response, fileContent, {
        output,
        action: post_convert,
        path,
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

      //console.log({ _max, _index, _chunk, _id });

      const base_dir = './tmp/chunks';
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
      const file_name = `${dir}/${_index}.txt`;
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
        const base64_crc = crc32(base64_content);
        if (base64_crc !== _crc) {
          console.log('CRC ERROR');
          return res.status(400).json({ message: 'CRC ERROR' });
        }
        base64_content = base64_content.replaceAll('\n', '');
        // 2. turn base64 to file depending on base64 header
        const mime_type = base64_content.split(';')[0].split(':')[1];
        const output = mime_type.split('/')[0];
        const new_extension = getExtensionFromMimeType(mime_type);
        writeFileSync(
          `${dir}/output${new_extension}`,
          base64_content.split(';base64,')[1],
          {
            encoding: 'base64',
          }
        );
        // 3. convert the file with default options
        const { args, ext } = getConvertParams(
          `${dir}/output${new_extension}`,
          output
        );

        console.log({ args, ext });
        const output_path = `./tmp/${_id}.${ext}`;
        ffmpeg.convert(output_path, args);
        dirsToCleanup.push(output_path);

        const fileContent = readFileSync(output_path);
        await getDimensionsAndOrientation(
          output,
          output,
          output_path,
          response
        );
        const duration = ffmpeg.getDuration(output_path);
        response.duration = duration;
        setFileName(output, output, response, _id);

        console.log('1', { response });
        postConvertActions(response, fileContent, {
          output,
          action: 'stream',
          path: '/chunk-uploads',
        });

        // cleanup
        cleanup(dirsToCleanup);

        return res.send(response);
      } else {
        return res.send({ success: true });
      }
    } catch (ex) {
      console.error({ ex });
      cleanup(dirsToCleanup);
      return res.status(500).json({ message: ex.message });
    }
  },
};

const cleanup = async paths => {
  if (paths.length > 0) {
    for (let p of paths) {
      console.log('Removing: ', p);
      // check if p is a directory
      if (lstatSync(p).isDirectory()) {
        try {
          rmdir(p, { recursive: true, force: true });
        } catch (e) {}
        continue;
      }
      unlink(p);
    }
  }
};

const getExtensionFromMimeType = mimeType => {
  const mimeTypeParts = mimeType.split('/');
  return '.' + mimeTypeParts[1];
};

const crc32 = function (r) {
  for (var a, o = [], c = 0; c < 256; c++) {
    a = c;
    for (var f = 0; f < 8; f++) a = 1 & a ? 3988292384 ^ (a >>> 1) : a >>> 1;
    o[c] = a;
  }
  for (var n = -1, t = 0; t < r.length; t++)
    n = (n >>> 8) ^ o[255 & (n ^ r.charCodeAt(t))];
  return (-1 ^ n) >>> 0;
};

const getConvertParams = (filePath, output) => {
  let args = [],
    ext = '';
  switch (output.toLowerCase()) {
    case 'video':
      args = ffmpeg.getBasicVideoParams(filePath);
      ext = 'mp4';
      break;
    case 'audio':
      args = ffmpeg.getBasicAudioParams(filePath);
      ext = 'mp3';
      break;
  }

  return { args, ext };
};

const postConvertActions = async (
  response,
  fileContent,
  options = {
    output: 'video',
    action: 'upload',
    path: '/',
  }
) => {
  const mimeType = options.output === 'video' ? 'video/mp4' : 'audio/mp3';
  if (options.action === 'upload') {
    const folder = path ? path : process.env.AWS_BUCKET_PATH || '';
    const destFileName = `${folder}${response.filename}`;

    const mimeType = options.output === 'video' ? 'video/mp4' : 'audio/mp3';
    const resp1 = await upload({
      destFileName,
      fileContent,
      mimeType,
    });
    console.log({ resp1 });
    if (resp1) {
      response.file = resp1.url;
    }
    if (response.frame) {
      const frameContent = readFileSync(response.frame);
      const destFrameName = `${folder}${response.frame.replace('tmp/', '')}`;
      const resp2 = await upload({
        destFileName: destFrameName,
        fileContent: frameContent,
        mimeType: 'image/jpg',
      });
      console.log({ resp2 });
      if (resp2) {
        response.frame = resp2.url;
      }
    }
  } else {
    response.file = `data:${mimeType};base64,` + fileContent.toString('base64');

    if (response.frame) {
      const frameContent = readFileSync(response.frame);
      response.frame =
        'data:image/jpg;base64,' + frameContent.toString('base64');
    }
  }

  return response;
};

const setFileName = (output, fileType, response, fileName) => {
  if (output === 'video') {
    const dims = `${response.dimensions.width}x${response.dimensions.height}`;
    if (fileType === 'video') {
      const mode = response.orientation === 'landscape' ? 'h' : 'v';
      response.filename = `${fileName}-${response.duration}s-${mode}-${dims}.mp4`;
    } else {
      response.filename = `${fileName}-${response.duration}s-h-${dims}.mp4`;
    }
  } else {
    response.filename = `${fileName}-${response.duration}s.mp3`;
  }
};

const getDimensionsAndOrientation = async (
  output,
  fileType,
  output_path,
  response
) => {
  if (fileType === 'video' && output === fileType) {
    const video_frame_path = ffmpeg.getVideoFrame(output_path, '00:00:02');
    // const video_dimensions = ffmpeg.getVideoDimensions(file.path)
    const video_dimensions = await ffjpeg.getFrameDimensions(video_frame_path);
    console.log('Video dimensions: ', { video_dimensions });
    response.frame = video_frame_path;
    response.dimensions = video_dimensions;
    if (video_dimensions.width > video_dimensions.height) {
      response.orientation = 'landscape';
    } else {
      response.orientation = 'portrait';
    }
  }
};
