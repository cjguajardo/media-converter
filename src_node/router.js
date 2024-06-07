import express from 'express'
import multer from 'multer'
import os from 'os'
import converterController from './controllers/converter/index.js'
import authController from './controllers/auth/index.js'
import JWT from './utils/jwt.js'

const upload = multer({ dest: os.tmpdir() })
const router = express.Router()

const protected_urls = ['POST::/convert']

router.use((req, res, next) => {
  const { url, method } = req
  console.log({ url, method })
  if (protected_urls.indexOf(`${method}::${url}`) != -1) {
    const token = req.headers['authorization']?.replace('Bearer ', '')
    const jwt = new JWT()
    const valid_token = jwt.check(token)
    if (!valid_token) {
      return res.sendStatus(403)
    }
  }
  next()
})

router.get('/status', (_, res) => {
  return res.status(200).json({ message: 'Server is running' })
})

router.get('/recorder-test', (_, res) => {
  return res.sendFile(`/app/html/index.html`)
})

router.post('/convert', upload.single('file'), converterController.auto)

router.post('/login', authController.login)

export default router
