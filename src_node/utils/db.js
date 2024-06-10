import { createClient } from '@libsql/client/web'

export const getClient = () => {
  const config = {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  }
  const db = createClient(config)
  return db
}

export const init = async () => {
  const db = getClient()
  await db.batch(
    [
      'CREATE TABLE IF NOT EXISTS keys (ID TEXT NOT NULL, SECRET TEXT NOT NULL, PRIMARY KEY(ID))',
      'CREATE TABLE IF NOT EXISTS tokens (KEY_ID TEXT NOT NULL, TOKEN	TEXT NOT NULL, EXPIRE	NUMERIC DEFAULT 0, PRIMARY KEY(KEY_ID))',
    ],
    'write'
  )
}

// export const init = async () => {
//   await execute({
//     sql: 'CREATE TABLE IF NOT EXISTS keys (ID TEXT NOT NULL, SECRET TEXT NOT NULL, PRIMARY KEY(ID))',
//   })
//   await execute({
//     sql: 'CREATE TABLE IF NOT EXISTS tokens (KEY_ID TEXT NOT NULL, TOKEN TEXT NOT NULL, EXPIRE NUMERIC DEFAULT 0, PRIMARY KEY(KEY_ID))',
//   })
// }


/**
 * Executes a SQL query using the Turso database API.
 * @param {Object} options - The options for executing the query.
 * @param {string} options.sql - The SQL query to execute.
 * @param {Array} [options.args] - The positional arguments for the query. The `args` array should be `[{ type:"string", value:"value" }]`.
 * @param {Object} [options.named_args] - The named arguments for the query. The `named_args` object should be `[{ name: "name", value: { type: "string", value: "value" } }]`.
 *  @example
 * execute({
 *  sql: 'SELECT * FROM users WHERE id = ?',
 * args: ['123']
 * });
 * @returns {Promise} A promise that resolves with the query result or rejects with an error.
 */
export const execute = async ({ sql, args, named_args }) => {
  return new Promise((resolve, reject) => {
    const authToken = process.env.TURSO_AUTH_TOKEN
    const url = process.env.TURSO_DATABASE_URL

    console.log({ authToken, url, sql, args, named_args })

    const stmt = { sql }
    if (args) stmt.args = args
    if (named_args) stmt.named_args = named_args

    const body = JSON.stringify({
      requests: [
        { type: "execute", stmt: stmt },
        { type: "close" },
      ],
    })
    console.log({ body })

    fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body
    })
      .then((res) => {
        console.log({ res })
        return res.json()
      })
      .then((data) => { console.log(data); resolve(data) })
      .catch((err) => { console.log({ err }); reject(err) })
  })
}