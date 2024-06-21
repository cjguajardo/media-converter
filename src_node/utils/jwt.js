import {
  createHmac,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'node:crypto'
import { getClient } from './db.js'

class JWT {
  #EXP_TIME = process.env.JWT_TTL; // 30 days = 30 * 24 * 60 * 60; 5 minutes = 300; 2 minutes = 120
  #ALGO = 'aes-256-cbc';

  constructor() {
    this.header = {
      typ: 'JWT',
      alg: 'HS256',
    }
    this.issuer = process.env.JWT_ISSUER
  }

  generate (key, account = null) {
    if (typeof key == 'undefined' || key == null || key == '') {
      throw 'Nothing to sign'
    }
    const now = Math.round(new Date().getTime() / 1000)
    this.payload = {
      iss: this.issuer,
      sub: key,
      iat: now,
      exp: Number(now) + Number(this.#EXP_TIME),
      callback: '',
      email: '',
    }

    if (account && account.CALLBACK_URL) {
      this.payload.callback = account.CALLBACK_URL
    }
    if (account && account.ID) {
      this.payload.email = account.ID
    }

    const encoded_header = btoa(JSON.stringify(this.header))
    const encoded_payload = btoa(JSON.stringify(this.payload))
    // console.log({ encoded_header, encoded_payload });

    const body = encoded_header + '.' + encoded_payload
    const hash = createHmac('sha256', process.env.ENCRYPTION_KEY)
      .update(body)
      .digest('hex')

    const _encrypted = btoa(JSON.stringify(this.encrypt(body)))
    const token = _encrypted + '.' + hash

    return { token, exp: this.payload.exp }
  }

  get_decoded (token) {
    if (!token || token.indexOf('.') == -1) { return false }
    const parts = token.split('.')

    const decodedString = Buffer.from(parts[0], 'base64').toString()
    let json = null
    try {
      json = JSON.parse(decodedString)
    } catch (e) {
      console.warn('Malformed token')
      return false
    }

    if (!json.iv || !json.encryptedData) {
      console.warn('Bad token')
      return false
    }

    const _decrypted = this.decrypt(json)
    const hash = createHmac('sha256', process.env.ENCRYPTION_KEY)
      .update(_decrypted)
      .digest('hex')

    if (hash != parts[1]) {
      console.warn('Bad hash')
      return false
    }

    try {
      const [header, payload] = _decrypted.split('.')
      const decoded_header = JSON.parse(
        Buffer.from(header, 'base64').toString()
      )
      const decoded_payload = JSON.parse(
        Buffer.from(payload, 'base64').toString()
      )

      return { header: decoded_header, payload: decoded_payload }
    } catch (e) {
      console.log('ERROR:', { e })
      console.warn('Bad token')
      return false
    }
  }

  async check (token) {
    return new Promise((resolve, _) => {
      const decoded = this.get_decoded(token)
      if (!decoded) {
        resolve(false)
        return
      }

      try {
        const { header: decoded_header, payload: decoded_payload } = decoded

        // console.log({ decoded_payload, decoded_header });
        if (
          decoded_header.typ === this.header.typ &&
          decoded_header.alg === this.header.alg
        ) {
          if (decoded_payload.iss === this.issuer) {
            const now = Math.round(new Date().getTime() / 1000)
            const db = getClient()
            if (decoded_payload.exp < now) {
              resolve(false)
              return
            }

            db.execute({
              sql: 'SELECT * FROM accounts WHERE ID = ?',
              args: [decoded_payload.sub],
            }).then(account => {
              if (account && account.rows.length > 0) {
                // console.log({ account: account.rows })
                if (account.rows[0].CALLBACK_URL == decoded_payload.callback) {
                  resolve(true); return
                }
                resolve(false); return
              } else {
                resolve(false); return
              }
            })
          }
          else {
            console.warn('Bad issuer')
            resolve(false)
            return
          }
        } else {
          console.warn('Bad header')
          resolve(false)
          return
        }
      } catch (e) {
        console.log('ERROR:', { e })
        console.warn('Bad token')
        resolve(false)
        return
      }
    })
  }

  encrypt (text) {
    const iv = randomBytes(16)
    const cipher = createCipheriv(
      this.#ALGO,
      Buffer.from(process.env.ENCRYPTION_KEY),
      iv
    )
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') }
  }

  decrypt (hash) {
    const decipher = createDecipheriv(
      this.#ALGO,
      Buffer.from(process.env.ENCRYPTION_KEY),
      Buffer.from(hash.iv, 'hex')
    )
    let decrypted = decipher.update(Buffer.from(hash.encryptedData, 'hex'))
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  }
}

export default JWT
