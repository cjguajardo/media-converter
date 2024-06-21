import { getClient } from '../../utils/db.js'
import JWT from '../../utils/jwt.js'
import { createHmac } from 'node:crypto'

const upsertTokenRow = async (db, account, token) => {
  db.execute({
    sql: 'SELECT * FROM tokens WHERE KEY_ID = ?',
    args: [account.ID],
  }).then((result) => {
    const now = Math.round(new Date().getTime() / 1000)
    if (result.rows.length > 0) {
      db.execute({
        sql: "UPDATE tokens SET TOKEN = ?, EXPIRE = ?, CALLBACK_URL = ?, UPDATED_AT = ? WHERE KEY_ID = ?",
        args: [token.token, token.exp, account.CALLBACK_URL, now, account.ID],
      })
    } else {
      db.execute({
        sql: 'INSERT INTO tokens (KEY_ID, TOKEN, EXPIRE, CALLBACK_URL, CREATED_AT, UPDATED_AT) VALUES (?, ?, ?, ?, ?, ?)',
        args: [account.ID, token.token, token.exp, account.CALLBACK_URL, now, now],
      })
    }
  })
}

export default {
  login: async (req, res) => {
    const key = req.body.key
    const secret = req.body.secret

    const hashed = createHmac('sha256', process.env.ENCRYPTION_KEY)
      .update(secret)
      .digest('hex')

    const db = getClient()
    let account = await db.execute({
      sql: 'SELECT * FROM accounts WHERE ID = ?',
      args: [key],
    })

    if (account && account.rows.length > 0) {
      account = account.rows[0]
      if (account.SECRET === hashed) {
        const jwt = new JWT()
        // generate Token
        const token = jwt.generate(key, account)
        // append or update token in db
        await upsertTokenRow(db, account, token)
        return res.send(token)
      }
    }

    res.status(400).send({ message: "Credentials doesn't match" })
  },
  check: () => { },
}
