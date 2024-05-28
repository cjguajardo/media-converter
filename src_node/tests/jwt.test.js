import JWT from '../utils/jwt.js';

import { expect, test } from 'vitest';

test('throws error on empty key', () => {
  const jwt = new JWT();
  expect(() => jwt.generate()).toThrowError(/^Nothing to sign$/);
});

test('payload must have correct data', () => {
  const jwt = new JWT();

  const now = Math.round(new Date().getTime() / 1000);

  const token = jwt.generate('text');

  expect(jwt.payload).toStrictEqual({
    sub: 'text',
    iat: now,
    iss: process.env.JWT_ISSUER,
    exp: now + 2592000,
  });

  expect(token).toHaveProperty('token');
  expect(token).toHaveProperty('exp', jwt.payload.exp);
});

test('check sould return boolean', () => {
  const jwt = new JWT();

  const result = jwt.check(null);

  expect(result).toBeTypeOf('boolean');
});

test('check sould return true on valid token', () => {
  const jwt = new JWT();
  const data = {
    token:
      'eyJpdiI6IjQyN2E1YjA0ZTY3MWVlMTkxOTljMjQ0YzAwNzI0OTEyIiwiZW5jcnlwdGVkRGF0YSI6IjBiN2U1N2QwMWZhYTVlNGQxM2JmZTVlNDAzZjg1NGYxOWFjMmQ5ZmFlMDljMGI1Yzk5ZDdkMGRiNzA5ZTg2NTliODZjZjhkZmQ2YjU5MjcxZTY0ZDY4NTUyZDlmYWI2OWQyZTJkOTIwNTI3ZWQxOGY1NGMzNDQ0ZTAyMGUyODM1NTVjMDRiNzU4NjZkYmRkOGZkZGU4ZjhiMjNjNjFiMDI0YzcyMDQ5OWFjOWI5MjVmYzliZWJlY2IwMzBkMTc4ZTRhNGQ5ZTk5MzU4OGI3YjQ1MDFiZTYyODkzODI3NTYyODY0NzZiOWM4OTE0MGY3NTc5YjYzNDVlNmNiY2FiZmZmNzE0NWNmNzVjN2NjNThhYTRkNTU4OGU0YjhhMDE5ZDFkNWVmNThkYjEzNjE5NTMzNTEwMjU1MjBlYmU5MzM4In0=.da69437e51f2b2cc5126981de033f0996a5bf22671f38617b994d4458fd2682a',
    exp: 1719176616,
  };

  const result = jwt.check(data.token);

  expect(result).toBe(true);
});

test('check sould return false on invalid token', () => {
  const jwt = new JWT();
  const data = {
    token:
      'eyJpdiI6IjQyN2E1YjA0ZTn0rwwu.da69437e51f2b2cc5126981de033f0996a5bf22671f38617b994d4458fd2682a',
    exp: 1719176616,
  };

  const result = jwt.check(data.token);

  expect(result).toBe(false);
});
