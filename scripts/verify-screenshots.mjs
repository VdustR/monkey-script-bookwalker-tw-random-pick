import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const directory = new URL('../docs/images/', import.meta.url);
const capture = JSON.parse(await readFile(new URL('capture.json', directory), 'utf8'));
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
for (const image of capture.images) {
  const bytes = await readFile(new URL(image.file, directory));
  assert.ok(bytes.subarray(0, 8).equals(pngSignature), `${image.file} 必須是真正的 PNG，不能只改副檔名。`);
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR');
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  assert.equal(width, image.pixelWidth, `${image.file} 的寬度與拍攝紀錄不符。`);
  assert.equal(height, image.pixelHeight, `${image.file} 的高度與拍攝紀錄不符。`);
  assert.ok(width >= image.cssWidth * 2 && height >= image.cssHeight * 2, `${image.file} 需保留至少 2 倍顯示尺寸的像素。`);
  console.log(`${image.file}：PNG ${width} × ${height}，符合 2 倍像素要求。`);
}
