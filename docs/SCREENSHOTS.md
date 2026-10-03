# Screenshot provenance

`images/bookshelf.png` and `images/random-reader.png` were captured in Chrome on the actual BOOK☆WALKER Taiwan bookshelf, on October 3, 2026. The site's markup, layout, typography, icons, and styles were left intact. The built userscript supplies the dice control and dialog.

Only displayed data was replaced: fictional titles, SVG covers, authors, publishers, publication and purchase dates, reader IDs, recent-reading entries, avatar, notification counts, and page data. Shelf requests in that disposable tab returned synthetic HTML. No library mutation was submitted.

`scripts/screenshot-stubs.js` is a documentation-only helper for a disposable, signed-in bookshelf tab. Never include it in the production bundle or install it as a userscript. It changes the tab's DOM, overrides shelf fetch and randomness, and is discarded when the tab closes.

For a future capture:

1. Open a disposable tab on the real bookshelf and run the helper using browser developer tooling. Check for other personal data introduced by site changes, such as custom-list names, account menus, or new badges, before saving any image.
2. Remove an older userscript mount if present and execute the current built distribution so it reads only synthetic data. The cover URL parser accepts HTTP(S), so set the metadata cover to a temporary valid site image URL for rendering, then replace the rendered dialog image's `src` with the corresponding synthetic card's SVG data URL before capture. Do not change application CSS or layout.
3. Wait until all synthetic images have completed loading. Capture the shelf toolbar and the open dialog with surrounding site context.
4. Read back the selected title, book count, action labels, and reader link's `_blank` target from the same page state. Inspect every saved image for real covers, account information, and stale rendering before publishing.
5. Close the disposable tab. Do not click sample reader links or native account-mutation controls.

These screenshots demonstrate appearance using synthetic data. They do not prove actual account mutations or purchased-book entitlement.
