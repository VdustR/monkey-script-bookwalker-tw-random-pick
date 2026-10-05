# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

TypeScript and Svelte, requested by the user. A self-contained Tampermonkey userscript is the distribution format. Generated dist files belong with the source and must not be ignored.

TypeScript 6.0.3 is the user's selected compatibility boundary: svelte-check 4.7.6 accepts TypeScript 5 and 6 but does not yet accept TypeScript 7.

## Users

BOOK☆WALKER Taiwan readers choosing what to read from their existing bookshelf.

## Product Purpose

Choose a readable book from all pages of the current shelf category or custom list, then start reading in a new tab.

## Capabilities and Constraints

- Preserve the current category, custom list, and filters.
- Draw independently and uniformly from deduplicated books; no shuffle bag.
- Keep metadata, copying, and native shelf actions directly accessible.
- Handle empty shelves and loading failures explicitly.
- The initial version was 0.0.1. Patch releases update the package and userscript versions together.
- Release by building and committing dist alongside the source in the repository. Do not create GitHub Releases.

## Brand Commitments

Compact controls consistent with the original BOOK☆WALKER website. Keep its existing language and book content.

## Evidence on Hand

The prior userscript and the user's live Chrome bookshelf supplied the toolbar placement, pagination URLs, book metadata attributes, and native bookcase action attributes. Native account mutations have not been exercised.
