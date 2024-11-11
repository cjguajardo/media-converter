import express from 'express';
import router from './router.js';
import { init } from './utils/db.js';
import fs from 'node:fs';
import Cors from './utils/cors.js';

// Create tmp folder
if (!fs.existsSync('/app/tmp')) {
  fs.mkdirSync('/app/tmp');
}

const app = express();
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '15mb' }));

// Set cors
app.all('*', Cors.preflight);
app.options('*', Cors.options);
// After all other middleware and routes
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error stack to console
  res.status(500).send('Something broke!'); // Send a generic error message to the client
});
app.use(router);

app.listen(3001, () => {
  console.log('Server is running on port 3001');
  init().then(async () => {
    console.log('Database initialized');
  });
});
