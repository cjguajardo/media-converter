import fs from 'node:fs';

export default {
  index: (_, res) => {
    return res.status(200).json({ message: 'Server is running' });
  },
  test: (_, res) => {
    return res.sendFile(`/app/html/test.html`);
  },
  login: (_, res) => {
    return res.sendFile(`/app/html/login.html`);
  },
  tmp: (_, res) => {
    // read /app/tmp directory and list all files
    const files = [];
    fs.readdirSync('/app/tmp').forEach(file => {
      console.log(file);
      files.push(file);
    });
    return res.status(200).json(files);
  },
};
