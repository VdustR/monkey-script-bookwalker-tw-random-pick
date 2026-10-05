import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';

const script = await readFile(new URL('../dist/bookwalker-random-book.user.js', import.meta.url), 'utf8');
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
assert.ok(script.startsWith('// ==UserScript==\n'), 'Userscript metadata must precede executable code.');
const metadataEnd = script.indexOf('// ==/UserScript==');
assert.ok(metadataEnd > 0, 'Userscript metadata must have a closing marker.');
const metadata = script.slice(0, metadataEnd);
assert.equal(metadata.match(/^\/\/ @version\s+(\S+)/m)?.[1], pkg.version, 'Userscript and package versions must agree.');
assert.ok(metadata.includes('// @grant        none'), 'The userscript must retain its existing permission boundary.');
assert.equal(metadata.match(/^\/\/ @homepageURL\s+(\S+)/m)?.[1], pkg.homepage, '官方網站必須指向 package.json 的 GitHub repository。');
const patterns = [...metadata.matchAll(/^\/\/ @match\s+(\S+)/gm)].map((match) =>
  new RegExp('^' + match[1].split('*').map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$'));
const rootUrl = 'https://www.bookwalker.com.tw/bookcase/available_book_list';
for (const url of [rootUrl, `${rootUrl}?sort=4`, `${rootUrl}/`, `${rootUrl}/all?page=2`, `${rootUrl}/list/42?c=2`]) {
  assert.ok(patterns.some((pattern) => pattern.test(url)), `書櫃網址必須涵蓋：${url}`);
}
for (const url of [`${rootUrl}_backup`, 'https://example.com/bookcase/available_book_list', 'https://www.bookwalker.com.tw/member']) {
  assert.ok(!patterns.some((pattern) => pattern.test(url)), `不得涵蓋其他頁面：${url}`);
}
new Script(script, { filename: 'bookwalker-random-book.user.js' });
console.log('Verified userscript metadata, version, permissions, and JavaScript syntax.');
