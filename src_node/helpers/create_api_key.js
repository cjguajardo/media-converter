import { getClient, init } from '../utils/db.js'
import { createHmac } from 'node:crypto'
import readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const rl = readline.createInterface({ input: stdin, output: stdout })

const sendMail = async ({ to, key, secret }) => {
  console.log({ to, key, secret })
  const { data, error } = await resend.emails.send({
    from: 'REDMIN <no-reply@redmin.cl>',
    to: [to],
    subject: 'REDMIN media converter keys',
    html: `<h1>¡Hola!</h1>
    <h2>Tus claves de acceso para Redmin media converter</h2>
    <p><strong>KEY: ${key}</strong></p>
    <p><strong>SECRET: ${secret}</strong></p>
    <p>No distribuyas estos datos de acceso, son privados y pueden exponer servicios de pago a anónimos.
    <br/>
      Asegúrate de mantener estos datos en privado y por ningún motivo los expongas en tus proyectos
    </p>
`,
  })

  if (error) {
    console.error({ error })
    return
  }

  console.log({ data })
  return
}

// Test sendMail function
// sendMail({ to: 'cj.guajardo@gmail.com', key: 'test', secret: 'test' })

rl.question('Enter your email:')
  .then((email) => {
    rl.question('Enter your Callback URL for 2FA (optional):')
      .then((callback_url) => {
        rl.question('Enter your Host for 2FA (optional):')
          .then((host) => {
            const db = getClient()

            console.log({
              email,
              callback_url,
              host
            })

            init().then(async () => {
              const secret = createHmac('sha256', process.env.ENCRYPTION_KEY)
                .update(email + Math.random().toString(36).substring(2, 15))
                .digest('hex')

              const key = createHmac('sha256', process.env.ENCRYPTION_KEY)
                .update(email)
                .digest('hex')

              console.log('API Key:', key)
              console.log('API Secret:', secret)

              const hashed = createHmac('sha256', process.env.ENCRYPTION_KEY)
                .update(secret)
                .digest('hex')

              const result = await db.execute({
                sql: 'SELECT ID FROM accounts WHERE ID = ?',
                args: [email],
              })
              if (result.rows.length > 0) {
                db.execute({
                  sql: 'UPDATE accounts SET SECRET = ?, CALLBACK_URL = ?, HOST = ? WHERE ID = ?',
                  args: [hashed, callback_url, host, email],
                })
                  .then(async () => {
                    console.log('API Key updated successfully')
                    await sendMail({ to: email, key: email, secret })
                    process.exit(0)
                  })
                  .catch((error) => {
                    console.log(error)
                    process.exit(0)
                  })
              } else {
                db.execute({
                  sql: 'INSERT INTO accounts (ID, SECRET, CALLBACK_URL, HOST) VALUES (?,?,?,?)',
                  args: [email, hashed, callback_url, host],
                })
                  .then(async () => {
                    console.log('API Key created successfully')
                    await sendMail({ to: email, key: email, secret })
                    process.exit(0)
                  })
                  .catch((error) => {
                    console.log(error)
                    process.exit(0)
                  })
              }
            })
          })
      })
  })
  .catch((error) => {
    console.log({ error })
    process.exit(0)
  })

