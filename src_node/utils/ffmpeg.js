import { execFileSync } from 'child_process';
// import { readFileSync } from 'node:fs'

const AUDIO_BITRATE = '96k';
const PRESET = {
  ULTRAFAST: 'ultrafast',
  SUPERFAST: 'superfast',
  FAST: 'fast',
  MEDIUM: 'medium',
  SLOW: 'slow',
  SLOWER: 'slower',
  VERYSLOW: 'veryslow',
};

const exec = (cmd, args) => {
  try {
    const stdout = execFileSync(cmd, args, {
      encoding: 'utf-8',
      // stdio: 'pipe',
    });

    console.log({ stdout });
  } catch (err) {
    if (err.code) {
      // Spawning child process failed
      console.error(err.code);
    } else {
      // Child was spawned but exited with non-zero exit code
      // Error contains any stdout and stderr from the child
      const { stdout, stderr } = err;

      console.error({ stdout, stderr });
    }
  }
};

export const getBasicVideoParams = filePath => {
  // -c:v libx264 -preset medium -crf 25 -c:a aac -b:a 72k -movflags +faststart output4.mp4
  const args = [
    //'-loglevel','fatal',
    '-i',
    filePath,
    '-r',
    '24',
    '-c:v',
    'libx265',
    '-pix_fmt',
    'yuv420p',
    '-preset',
    PRESET.FAST,
    '-crf',
    '28',
    '-strict',
    'experimental',
    '-c:a',
    'aac',
    '-b:a',
    AUDIO_BITRATE,
    '-movflags',
    '+faststart',
  ];

  return args;
};

export const getCopyVideoParams = filePath => {
  let newFilePath = filePath;
  if (filePath.includes('.quicktime')) {
    newFilePath = filePath.replace('.quicktime', '.mov');
  }
  return ['-i', filePath, '-c', 'copy', newFilePath];
};

export const getBasicAudioParams = filePath => {
  const args = [
    '-loglevel',
    'fatal',
    '-i',
    filePath,
    '-vn',
    '-c:a',
    'libmp3lame',
    '-b:a',
    AUDIO_BITRATE,
    '-q:a',
    '2',
  ];

  return args;
};

export const convert = (output_path, args) => {
  console.log('\nConverting file to:', output_path);
  console.log('Command: ffmpeg', args.join(' '), '-y', output_path);
  // execFileSync('ffmpeg', [...args, '-y', output_path]);
  exec('ffmpeg', [...args, '-y', output_path]);
  console.log('\nFile converted: ', output_path);
  return output_path;
};

export const getVideoFrame = (filePath, time = '00:00:05') => {
  console.log('\nGetting frame from:', filePath);
  // ffmpeg -i input_video.mp4 -ss 00:00:05 -vframes 1 output_photogram.jpg
  const output_file =
    `${filePath}_frame_${time.replaceAll(':', '')}.jpg`.replace('.mp4', '');

  const args = [
    // '-loglevel',
    // 'fatal',
    '-i',
    filePath,
    '-ss',
    time,
    '-frames:v',
    1,
    output_file,
  ];
  // execFileSync('ffmpeg', args);
  exec('ffmpeg', args);
  console.log('\nFrame extracted:', output_file);

  return output_file;
};

export const getDuration = filePath => {
  //ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 myvideo.mp4
  const args = [
    // '-loglevel',
    // 'fatal',
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    filePath,
  ];
  const duration = Math.round(execFileSync('ffprobe', args));
  console.log('Duration: ', duration);

  return duration;
};

export const getVideoDimensions = filePath => {
  console.log('\nGetting video dimensions from:', filePath);
  //ffprobe -v error -show_entries stream=width,height -of default=noprint_wrappers=1:nokey=1 video.mp4
  //ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 tmp/v_171469823758586339.video.mp4
  const args = [
    // '-loglevel',
    // 'fatal',
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height',
    '-of',
    'csv=s=x:p=0',
    filePath,
  ];
  // console.log('Args: ', args.join(' '));
  const _dimensions = execFileSync('ffprobe', args)
    .toString()
    .trim()
    .split('x');

  const dimensions = {
    width: parseInt(_dimensions[0]),
    height: parseInt(_dimensions[1]),
  };
  console.log('Dimensions: ', { dimensions });

  return dimensions;
};

export const putWatermark = (filePath, watermarkPath) => {
  //ffmpeg -i video.mkv -i image.png -filter_complex 'overlay' out.mkv
  //ffmpeg -i video.mkv -i image.png -filter_complex "[1:v]scale=iw*min(iw\,ih*main_w/main_h):ih*min(iw\,ih*main_w/main_h)[scaled];[0:v][scaled]overlay" out.mkv
  console.log('putWatermark: ', { filePath, watermarkPath });
  const dim = getVideoDimensions(filePath);

  const output_path = `${filePath.replace('.mp4', '')}_watermarked.mp4`;
  const args = [
    // '-loglevel',
    // 'fatal',
    '-i',
    filePath,
    '-i',
    watermarkPath,
    '-filter_complex',
    `[1:v]scale=${dim.width}:${dim.height}[scaled];[0:v][scaled]overlay`,
    output_path,
  ];

  execFileSync('ffmpeg', args);
  console.log('Watermaked video: ', output_path);
  // console.log(result.toString());
  return output_path;
};

export const hasAudio = filePath => {
  // Configuración de los argumentos para ffprobe
  const args = [
    // '-loglevel',
    // 'fatal',
    '-show_streams',
    '-select_streams',
    'a', // Seleccionar solo flujos de audio
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    filePath,
  ];

  try {
    // Ejecutar ffprobe y capturar la salida
    const output = execFileSync('ffprobe', args).toString().trim();

    // Si hay alguna salida, el video contiene audio
    const hasAudio = output.length > 0;
    console.log('Has Audio:', hasAudio);

    return hasAudio;
  } catch (error) {
    console.error('Error checking audio:', error);
    return false;
  }
};
