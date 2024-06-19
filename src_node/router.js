import express from 'express'
import multer from 'multer'
import os from 'os'
import converterController from './controllers/converter/index.js'
import authController from './controllers/auth/index.js'
import uiController from './controllers/ui/index.js'
import JWT from './utils/jwt.js'
import { getClient } from './utils/db.js'

const upload = multer({ dest: os.tmpdir() })
const router = express.Router()

const protected_urls = ['POST::/convert']

router.use((req, res, next) => {
  const { url, method, headers } = req
  const userAgent = headers['user-agent'] ?? 'unknown'
  const host = headers['host'] ?? 'unknown'
  const referer = headers['referer'] ?? 'unknown'
  const x_forwarded_host = headers['x-forwarded-host'] ?? 'unknown'
  const x_forwarded_proto = headers['x-forwarded-proto'] ?? 'unknown'


  if (protected_urls.indexOf(`${method}::${url}`) != -1) {
    const token = req.headers['authorization']?.replace('Bearer ', '')
    const jwt = new JWT()
    const valid_token = jwt.check(token)
    console.log(
      method, url,
      {
        userAgent, host, referer,
        x_forwarded_host, x_forwarded_proto
      }, valid_token)
    const db = getClient()
    db.execute({
      sql: 'INSERT INTO requests (URL, METHOD, USER_AGENT, HOST, REFERER, X_FORWARDED_HOST, X_FORWARDED_PROTO, VALID_TOKEN, CREATED_AT) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [url, method, userAgent, host, referer, x_forwarded_host, x_forwarded_proto, `${valid_token}`, Date.now()]
    })
    if (!valid_token) {
      return res.sendStatus(403)
    }
  }
  next()
})

router.get('/', uiController.index)
router.get('/status', uiController.index)

router.get('/demo/login', uiController.login)
router.get('/demo/test', uiController.test)

router.post('/convert', upload.single('file'), converterController.auto)

router.post('/login', authController.login)

// redirect .css and .js files to /app/html
router.get('/*.(css|js|ico|png|mp4|mp3)', (_, res) => {
  return res.sendFile(`/app/html${_.url}`)
})

export default router
