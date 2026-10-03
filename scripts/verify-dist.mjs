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
new Script(script, { filename: 'bookwalker-random-book.user.js' });
console.log('Verified userscript metadata, version, permissions, and JavaScript syntax.');
