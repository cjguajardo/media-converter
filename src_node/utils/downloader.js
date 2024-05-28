import { createWriteStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import https from 'https';

export const downloader = async (url, dest_file) => {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest_file);
    console.log('Downloading: ', url);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('File downloaded as: ', dest_file);
          resolve(dest_file);
        });
      })
      .on('error', () => {
        unlink(dest_file);
        reject('Cant download the file');
      });
  });
};

export default downloader;
