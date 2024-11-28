import { expect, test } from 'vitest';
import { postConvertCallback } from '../controllers/converter/functions';

test('postConvertCallback should return a well formatted object', async () => {
  const filepath = '/app/tmp/test.mp4';
  const filetype = 'video/mp4';
  const key = 'aaaa';
  const result = await postConvertCallback(filepath, filetype, key);

  expect(result).toBeDefined();
  expect(result.file).toBeDefined();
  expect(result.file).toBe(filepath);
  expect(result.tipo).toBeDefined();
  expect(result.tipo).toBe(filetype);
  expect(result.llave).toBeDefined();
  expect(result.llave).toBe(key);
});
