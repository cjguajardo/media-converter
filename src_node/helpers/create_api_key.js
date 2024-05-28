import { getClient, init } from '../utils/db.js';
import { createHmac } from 'node:crypto';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const rl = readline.createInterface({ input: stdin, output: stdout });

rl.question('Enter your email:')
  .then((email) => {
    const db = getClient();

    init().then(async () => {
      const secret = createHmac('sha256', process.env.ENCRYPTION_KEY)
        .update(email + Math.random().toString(36).substring(2, 15))
        .digest('hex');

      console.log('API Key:', email);
      console.log('API Secret:', secret);

      const hashed = createHmac('sha256', process.env.ENCRYPTION_KEY)
        .update(secret)
        .digest('hex');

      const result = await db.execute({
        sql: 'SELECT ID FROM keys WHERE ID = ?',
        args: [email],
      });
      if (result.rows.length > 0) {
        db.execute({
          sql: 'UPDATE keys SET SECRET = ? WHERE ID = ?',
          args: [hashed, email],
        })
          .then(() => {
            console.log('API Key updated successfully');
            sendMail(email, email, secret);
            process.exit(0);
          })
          .catch((error) => {
            console.log(error);
            process.exit(0);
          });
      } else {
        db.execute({
          sql: 'INSERT INTO keys (ID, SECRET) VALUES (?,?)',
          args: [email, hashed],
        })
          .then(() => {
            console.log('API Key created successfully');
            sendMail(email, email, secret);
            process.exit(0);
          })
          .catch((error) => {
            console.log(error);
            process.exit(0);
          });
      }
    });
  })
  .catch((error) => {
    console.log({ error });
    process.exit(0);
  });

const sendMail = async ({ to, key, secret }) => {
  const { data, error } = await resend.emails.send({
    from: 'REDMIN <no-reply@redmin.cl>',
    to: [to],
    subject: 'REDMIN media converter keys',
    html: `
    <h2>Tus claves de acceso para Redmin media converter</h2>
    <p><strong>KEY: ${key}</strong></p>
    <p><strong>SECRET: ${secret}</strong></p>
    <p>No distribuyas estos datos de acceso, son privados</p>
`,
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
};
