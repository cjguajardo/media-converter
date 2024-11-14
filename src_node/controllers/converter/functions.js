import { upload } from '../../utils/s3.js';
import { readFileSync, lstatSync, existsSync, mkdirSync } from 'node:fs';
import * as ffmpeg from '../../utils/ffmpeg.js';
import * as ffjpeg from '../../utils/ffjpeg.js';
import { unlink, readdir, rmdir } from 'node:fs/promises';
import path from 'node:path';

export const cleanup = async paths => {
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

export const getExtensionFromMimeType = mimeType => {
  const mimeTypeParts = mimeType.split('/');
  return '.' + mimeTypeParts[1];
};

export const crc32 = function (r) {
  for (var a, o = [], c = 0; c < 256; c++) {
    a = c;
    for (var f = 0; f < 8; f++) a = 1 & a ? 3988292384 ^ (a >>> 1) : a >>> 1;
    o[c] = a;
  }
  for (var n = -1, t = 0; t < r.length; t++)
    n = (n >>> 8) ^ o[255 & (n ^ r.charCodeAt(t))];
  return (-1 ^ n) >>> 0;
};

export const getConvertParams = (filePath, output) => {
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

export const postConvertActions = async (
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
    const folder = options.path
      ? options.path
      : process.env.AWS_BUCKET_PATH || '';
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

export const setFileName = (output, fileType, response, fileName) => {
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

export const getDimensionsAndOrientation = async (
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

export const checkPath = path => {
  if (path != null) {
    if (path.charAt(path.length - 1) != '/') {
      path = `${path}/`;
    }
    if (path.charAt(0) == '/') {
      path = path.substring(1);
    }
  }
};

export const cleanTMPDirectory = async (directory, hours = 2) => {
  // if directory not exists, create it
  if (!existsSync(directory)) {
    mkdirSync(directory);
  }
  readdir(directory).then(async files => {
    for (const file of files) {
      const filePath = path.join(directory, file);
      // check file creation date
      const fileCreationDate = lstatSync(filePath).birthtime;
      const hours = 2;
      // if file is older than 2 hours, then delete it
      if (fileCreationDate < Date.now() - 1000 * 3600 * hours) {
        if (lstatSync(filePath).isDirectory()) {
          try {
            rmdir(filePath, { recursive: true, force: true });
          } catch (e) {}
          continue;
        }
        unlink(filePath);
      }
    }
  });
};
