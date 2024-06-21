import JWT from '../utils/jwt.js'

import { expect, test } from 'vitest'

test('throws error on empty key', () => {
  const jwt = new JWT()
  expect(() => jwt.generate()).toThrowError(/^Nothing to sign$/)
})

test('payload must have correct data', () => {
  const jwt = new JWT()

  const now = Math.round(new Date().getTime() / 1000)

  const token = jwt.generate('text')

  expect(jwt.payload).toStrictEqual({
    sub: 'text',
    iss: process.env.JWT_ISSUER,
    iat: now,
    exp: now + Number(process.env.JWT_TTL),
    callback: '',
    email: '',
  })

  expect(token).toHaveProperty('token')
  expect(token).toHaveProperty('exp', jwt.payload.exp)
})

test('check sould return boolean', async () => {
  const jwt = new JWT()

  const result = await jwt.check(null)

  expect(result).toBeTypeOf('boolean')
})

test('check sould return true on valid token', async () => {
  const jwt = new JWT()
  const data = {
    token:
      'eyJpdiI6IjYxNTJmNDExODhlNzMyZGZkNDI4MTI2MDYwOWE1YWE2IiwiZW5jcnlwdGVkRGF0YSI6ImE0YzQxZGQ3MjhjN2Q2YjQzYzQwM2E2YzM4ZGY5ODFkOTgxMDJmZDk5ZWEwOGNiYWIwMDQ0YTI3YmRkMTM3YWI3ZTc5ZDdlNmExMjMzYjM4NTQ0MmI2YjM1NDI3NTNjMGQyNmM2ZGMzN2E5MGU3MjRmMTdiN2IxZThmZTUxZGQ1YjUzNjdlZGVkZjA2N2MwNTgyNWZjYjIxNjg0NjE3NmZlNDFjYjdkMTRhYjEzZmMxNDZhMzEwOGJkMTFkOTkyYjg4ZjJmNmI4NTcwOTljYWQ3NjRhOTg1Y2U4NGU3NDMzZmI0OTlhMmU4MDg2YThjMDIyMjllZWU1OGIxMGJkYjE4N2Y2OWQwOTcxZTRmNjdhMTRmYzRkMDVjODE4NzYyNTFkYjBiNWU5YjM4NmZiMGQ5NDcyY2I4MWViYjY5ZGNhMDQwNTYxNzNkMGI5ZGUzMmZjNjMxZDA5YWZlZmZlN2ExY2QxZmU1OTRjM2QxNjhjYTAyYTlkNDVhNGUzZjhmNjY4NjQ0MGRlNDBmMTU3Mjk0MzU5YjgxZGQ2OGEwMTMyZmVjNmQxNDMwOGEzY2NkMWY2MWY4NDQxNjY0YzRiMjFiYWNmYjNiYWI4YmY1NTg0NDUyNDJkNzU1ODgxMjNmNDVjMmI3MWQyZjkwYmM1YmM4MTdmOGZmNjhiNGE2NzVhNGI3Mzc2ODJlNTU2MDhmMzAzNWE1N2MzYmRhYTAzOWEifQ==.d668e9fb278b258283d4a685d972728db33bbbe75596a9480cfa0de2032d074e',
    exp: 1719083677,
  }

  const result = await jwt.check(data.token)

  expect(result).toBe(true)
})

test('check sould return false on invalid token', async () => {
  const jwt = new JWT()
  const data = {
    token:
      'eyJpdiI6IjQyN2E1YjA0ZTn0rwwu.da69437e51f2b2cc5126981de033f0996a5bf22671f38617b994d4458fd2682a',
    exp: 1719176616,
  }

  const result = await jwt.check(data.token)

  expect(result).toBe(false)
})
