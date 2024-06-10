import { execute } from '../../utils/db.js'
import JWT from '../../utils/jwt.js'
import { createHmac } from 'node:crypto'

export default {
  login: async (req, res) => {
    const key = req.body.key
    const secret = req.body.secret

    const hashed = createHmac('sha256', process.env.ENCRYPTION_KEY)
      .update(secret)
      .digest('hex')

    console.log({ key, secret, hashed })

    const result = await execute({
      sql: 'SELECT * FROM keys WHERE ID = ?',
      args: [key],
    })

    if (result && result.rows.length > 0) {
      console.log({ _1: hashed, _2: result.rows[0].SECRET })
      if (result.rows[0].SECRET == hashed) {
        const jwt = new JWT()
        const token = jwt.generate(key)
        // generate Token
        return res.send(token)
      }
    }

    res.status(400).send({ message: "Credentials doesn't match" })
  },
  check: () => { },
}
