import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCES_KEY,
  },
});

export const upload = async ({ destFileName, fileContent }) => {
  return new Promise((resolve, reject) => {
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
        resolve({
          message: 'File uploaded successfully',
          requestId: response.$metadata.requestId,
          url,
        });
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};
