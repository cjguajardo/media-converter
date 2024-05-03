import express from 'express';
import multer from 'multer';
import os from 'os';
import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const upload = multer({ dest: os.tmpdir() });
const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCES_KEY,
  },
});

const router = express.Router();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(router);

router.get('/', (_, res) => {
  return res.status(200).json({ message: 'Server is running' });
});

router.get('/recorder-test', (_, res) => {
  return res.sendFile(`/app/html/index.html`);
});

router.post('/', upload.single('file'), (req, res) => {
  try {
    const name = req.body.name;
    const file = req.file;

    // libmp3lame, aac
    const args = ['-loglevel', 'fatal', '-i', file.path];

    let ext = 'mp3';
    if (name.indexOf('.video') != -1) {
      ext = 'mp4';
      args.push('-c:v', 'libx264');
      args.push('-strict', 'experimental');
      args.push('-c:a', 'aac');
      args.push('-b:a', '128k');
      args.push('-q:v', '15');
    } else {
      args.push('-c:a', 'libmp3lame');
    }

    const output = `tmp/${name}.${ext}`;
    execFileSync('ffmpeg', [...args, '-y', output]);

    const fileContent = readFileSync(output);
    const folder = process.env.AWS_BUCKET_PATH || '';
    const destFileName = `${folder}${name}.${ext}`;

    const command = new PutObjectCommand({
      ACL: 'public-read',
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: destFileName,
      Body: fileContent,
    });

    client
      .send(command)
      .then((response) => {
        // console.log({ response });
        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${destFileName}`;
        return res.status(200).json({
          message: 'File uploaded successfully',
          requestId: response.$metadata.requestId,
          url,
        });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ message: err });
      });
  } catch (ex) {
    return res.status(500).json({ message: ex.message });
  }
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
