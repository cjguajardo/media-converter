import express from 'express';
import multer from 'multer';
import os from 'os';
import converterController from './controllers/converter/index.js';
import authController from './controllers/auth/index.js';
import uiController from './controllers/ui/index.js';
import JWT from './utils/jwt.js';
import { getClient } from './utils/db.js';
import checkVerifier from './helpers/check_verifier.js';
import { cleanTMPDirectory } from './controllers/converter/functions.js';

const upload = multer({ dest: os.tmpdir() });
const router = express.Router();

const protected_urls = ['POST::/convert__'];

router.use(async (req, res, next) => {
  const { url, method, headers } = req;
  const userAgent = headers['user-agent'] ?? 'unknown';
  const host = headers['host'] ?? 'unknown';
  const referer = headers['referer'] ?? 'unknown';
  const x_forwarded_host = headers['x-forwarded-host'] ?? 'unknown';
  const x_forwarded_proto = headers['x-forwarded-proto'] ?? 'unknown';

  cleanTMPDirectory('/tmp');
  cleanTMPDirectory('/app/tmp');
  if (protected_urls.indexOf(`${method}::${url}`) != -1) {
    const token = headers['authorization']?.replace('Bearer ', '');
    const verifier_token = headers['verifier'] ?? null;
    const jwt = new JWT();
    const valid_token = await jwt.check(token);

    const db = getClient();
    db.execute({
      sql: 'INSERT INTO requests (URL, METHOD, USER_AGENT, HOST, REFERER, X_FORWARDED_HOST, X_FORWARDED_PROTO, VALID_TOKEN, CREATED_AT) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
        url,
        method,
        userAgent,
        host,
        referer,
        x_forwarded_host,
        x_forwarded_proto,
        `${valid_token}`,
        Date.now(),
      ],
    });

    if (!valid_token) {
      return res.status(400).send({ error: 'Invalid token' });
    }

    const decoded = jwt.get_decoded(token);
    if (!decoded) {
      return res.status(400).send({ error: 'Invalid token' });
    }

    const { payload: decoded_payload } = decoded;
    const account = await db.execute({
      sql: 'SELECT * FROM accounts WHERE ID = ?',
      args: [decoded_payload.sub],
    });

    if (!account || account.rows.length == 0) {
      return res.status(400).send({ error: 'Account not found' });
    }

    if (account.rows[0].CALLBACK_URL != decoded_payload.callback) {
      return res.status(400).send({ error: 'Callback URL mismatch' });
    }

    if (account.rows[0].CALLBACK_URL && account.rows[0].CALLBACK_URL != '') {
      if (!verifier_token) {
        return res.status(403).send({ error: 'Missing verifier token' });
      }

      const success = await checkVerifier(
        account.rows[0].CALLBACK_URL,
        verifier_token
      );
      console.log('pass verification', { success });

      if (success === false) {
        return res.status(403).send({ error: 'Verifier token mismatch' });
      }
    }
  }
  next();
});

router.get('/', uiController.index);
router.get('/status', uiController.index);

router.get('/demo/login', uiController.login);
router.get('/demo/test', uiController.test);
/**
 * Converts and compress audio and video
 */
router.post('/convert', upload.single('file'), converterController.auto);
router.post('/upload-chunk', converterController.uploadChunk);
/**
 * Take screenshots of any website
 */
router.post('/web-to-img', converterController.webToImg);

router.post('/login', authController.login);

// redirect .css and .js files to /app/html
router.get('/*.(css|js|ico|png|mp4|mp3)', (_, res) => {
  return res.sendFile(`/app/html${_.url}`);
});

export default router;
