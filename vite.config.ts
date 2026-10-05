import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string; homepage: string };

const metadata = `// ==UserScript==
// @name         BOOK☆WALKER 書櫃隨機閱讀
// @namespace    https://www.bookwalker.com.tw/
// @version      ${pkg.version}
// @description  從目前書櫃分類或自訂書單的全部分頁隨機選書，在新分頁閱讀。
// @homepageURL  ${pkg.homepage}
// @match        https://www.bookwalker.com.tw/bookcase/available_book_list
// @match        https://www.bookwalker.com.tw/bookcase/available_book_list?*
// @match        https://www.bookwalker.com.tw/bookcase/available_book_list/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==`;

export default defineConfig({
  plugins: [
    svelte({ emitCss: false, compilerOptions: { css: 'injected' } }),
    {
      name: 'userscript-metadata',
      generateBundle(_options, bundle) {
        for (const output of Object.values(bundle)) {
          if (output.type === 'chunk') output.code = `${metadata}\n${output.code}`;
        }
      },
    },
  ],
  build: {
    target: 'es2022',
    lib: { entry: 'src/main.ts', name: 'BookwalkerRandomReader', formats: ['iife'], fileName: () => 'bookwalker-random-book.user.js' },
    emptyOutDir: true,
  },
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] },
});
