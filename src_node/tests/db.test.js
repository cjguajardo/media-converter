import { expect, test } from 'vitest'
import { getClient } from '../utils/db'

const key = 'cguajardo@redmin.cl'
test('execute should retieve data from the database', async () => {
  // const result = await execute({
  //   sql: 'SELECT * FROM keys WHERE ID = ?',
  //   args: [{ type: 'string', value: key }],
  // })
  const db = getClient()
  const result = await db.execute({
    sql: 'SELECT * FROM keys WHERE ID = ?',
    args: [key],
  })

  expect(result).toBeDefined()
  expect(result.rows).toBeDefined()
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].ID).toBeDefined()
  expect(result.rows[0].SECRET).toBeDefined()
})