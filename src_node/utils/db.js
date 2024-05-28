import { createClient } from '@libsql/client';

export const getClient = () => {
  const config = {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  };
  const db = createClient(config);
  return db;
};

export const init = async () => {
  const db = getClient();
  await db.batch(
    [
      'CREATE TABLE IF NOT EXISTS keys (ID TEXT NOT NULL, SECRET TEXT NOT NULL, PRIMARY KEY(ID))',
      'CREATE TABLE IF NOT EXISTS tokens (KEY_ID TEXT NOT NULL, TOKEN	TEXT NOT NULL, EXPIRE	NUMERIC DEFAULT 0, PRIMARY KEY(KEY_ID))',
    ],
    'write'
  );
};
