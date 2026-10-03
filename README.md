# BOOK☆WALKER Taiwan Random Reader

Choose your next book from every page of your current BOOK☆WALKER Taiwan shelf category or custom list. Start reading in a new tab, reroll, or use the site's shelf actions from one compact dialog.

## Install

[**Install the userscript**](https://raw.githubusercontent.com/VdustR/monkey-script-bookwalker-tw-random-pick/refs/heads/main/dist/bookwalker-random-book.user.js)

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. In Chrome, open **Extensions → Manage Extensions → Tampermonkey → Details** and enable **Allow User Scripts** when that setting is available. See [Tampermonkey's official instructions](https://www.tampermonkey.net/faq.php#Q209) for your browser version.
3. Open [`dist/bookwalker-random-book.user.js`](dist/bookwalker-random-book.user.js), then click **Raw**. Tampermonkey should display its installation screen; choose **Install**.
4. Sign in to [BOOK☆WALKER Taiwan](https://www.bookwalker.com.tw/) and open your **線上書櫃**. Reload the page if it was already open.
5. Find the dice button beside the shelf toolbar's archive control. Its tooltip is **從目前書櫃隨機選書**.

If Raw opens as plain text, create a new script in the Tampermonkey dashboard, replace the entire editor contents with the file, and save. Keep only one enabled copy of this script.

## Use

1. Open the category or custom list you want to draw from. Keep any desired site filters selected.
2. Click the dice button. The first draw loads every page in that scope and chooses one readable book.
3. Choose **開始閱讀** to open the site's reader in a new tab, or **重骰** to draw again.
4. **複製書籍資訊**, **加入書單**, and **封存** are directly visible below the reading controls. The shelf actions use BOOK☆WALKER's existing dialogs and confirmations.
5. Close with **關閉** or **Escape**. After changing the library, reload before drawing again to refresh the cached catalog.

The draw preserves your current category, custom list, and URL filters. Each deduplicated readable book has the same chance; repeat draws can choose the same book. Books without a reader link are excluded. Up to three pages load concurrently, and a successful catalog is reused until the page reloads.

### Examples

The following screenshots were captured from the **real BOOK☆WALKER website** on October 3, 2026. The site's HTML layout and CSS are retained. Books, cover artwork, authors, publishers, dates, reader IDs, recent-reading entries, avatar, notification counts, and pagination data are synthetic. They show no actual account library data.

![Real BOOKWALKER shelf with synthetic book covers and the dice toolbar button](docs/images/bookshelf.png)

The dialog shows the selected book, **開始閱讀**, **重骰**, and the visible secondary actions.

![Random-reading dialog on the real website with fictional book metadata and cover artwork](docs/images/random-reader.png)

## Update or remove

To update, open the current file under `dist/` again and install it over the existing copy. Updates are manual; this initial distribution does not declare automatic update URLs.

To disable or remove it, use the Tampermonkey dashboard. Your BOOK☆WALKER library remains managed by the website.

## Troubleshooting

| Problem | Action |
| --- | --- |
| Dice button missing | Confirm the script is enabled, user scripts are allowed, and the URL starts with `https://www.bookwalker.com.tw/bookcase/available_book_list/`. Reload the shelf. |
| Empty selection | Check the current category and filters. Only entries with a readable-book link are included. |
| Page-loading error | Use **重新嘗試**. If your login or shelf changed, reload and sign in again. A failing page does not produce a partial draw. |
| Duplicate controls | Disable the older copy in Tampermonkey, then reload. |
| `Illegal invocation` | Replace an older build with the current `dist` file. Native fetch is bound to the browser global in this version. |
| Library changes missing | Reload to clear the catalog cached for that page. |

The website's DOM and bookcase controller are integration dependencies. Chrome rendering, catalog behavior, and simulated action forwarding have been checked. Live account mutations through **加入書單** and **封存** have not been exercised.

## Privacy and permissions

The script uses `@grant none` and runs only on matching BOOK☆WALKER Taiwan bookshelf pages. It fetches additional pages from the same website using your existing session. It adds no analytics, external catalog service, or library upload. Copying writes to the clipboard only when you click the copy control.

## Development

Use Node.js **22.12 or newer** and npm. CI uses Node.js 24.

```sh
npm ci
npm run check
npm test
npm run build
```

The project uses Svelte 5, TypeScript 6, Vite, and `@tsconfig/strictest`, with exact versions in the lockfile. TypeScript 6 is the selected compatible version because the current `svelte-check` peer range excludes TypeScript 7. Library type checking remains enabled.

| Command | Purpose |
| --- | --- |
| `npm run check` | Check Svelte and strict TypeScript types. |
| `npm test` | Test extraction, pagination, scope preservation, deduplication, retries, and native-fetch receiver binding. |
| `npm run build` | Type-check, build one userscript with embedded CSS, and verify metadata, version, permissions, and syntax. |
| `npm run release` | Run tests and the complete build before committing the distribution. |
| `npm run dev` | Serve local synthetic preview fixtures. |

Source lives in `src/`; the installable artifact is `dist/bookwalker-random-book.user.js`. `tests/preview.html` uses mocked data and actions; `tests/native.html` keeps browser fetch native. See [the release process](docs/RELEASING.md) and [screenshot provenance](docs/SCREENSHOTS.md).

## License

[MIT](LICENSE) covers this project's code and authored synthetic assets. BOOK☆WALKER's name, logo, and website interface belong to their respective owners. This is an independent userscript.
