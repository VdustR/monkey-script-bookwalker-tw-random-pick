import { describe, expect, it, vi } from 'vitest';
import { Catalog, chooseBook, extractBooks, pageUrls } from '../src/catalog';

const base = 'https://www.bookwalker.com.tw/bookcase/available_book_list/list/42?c=2&sort=4';
function parse(html: string): Document { return new DOMParser().parseFromString(html, 'text/html'); }
function card(id: string, title = 'Test Book'): string {
  return `<div class="readerBooks"><input name="products" value="${id}">
    <a href="/browserViewer/${id}/read">Read</a><ul class="readerBookMoreMenu">
    <li data-action="click->bookcase#display_book_info" data-product_name="${title}" data-author="Test Author" data-product_image="https://example.com/cover.jpg"></li>
    <li data-action="click->bookcase#add_book" data-product_id="${id}">加入書單</li></ul></div>`;
}
const toolbar = '<div class="readerSettingBox"></div>';

describe('shelf scope and extraction', () => {
  it('loads /all pagination from the default shelf while retaining filters', () => {
    const url = 'https://www.bookwalker.com.tw/bookcase/available_book_list?sort=4';
    const root = parse(`<select class="pageNumSelect">
      <option value="/bookcase/available_book_list/all?&page=1">1</option>
      <option value="/bookcase/available_book_list/all?&page=2">2</option>
      <option value="/bookcase/available_book_list/buy?page=3">other category</option>
    </select>`);
    expect(pageUrls(root, url)).toEqual([
      'https://www.bookwalker.com.tw/bookcase/available_book_list/all?sort=4',
      'https://www.bookwalker.com.tw/bookcase/available_book_list/all?sort=4&page=2',
    ]);
    expect(pageUrls(root, url.replace('list?', 'list/?'))).toEqual(pageUrls(root, url));
  });

  it('changes only page while preserving custom list and active filters', () => {
    const root = parse(`<select class="pageNumSelect">
      <option value="${base}&page=2">2</option><option value="${base}&page=2">2</option>
      <option value="https://example.com/bookcase/available_book_list/list/42?page=3">outside</option>
      <option value="/bookcase/available_book_list/all?page=4">other shelf</option>
      <option value="/bookcase/available_book_list/list/42?page=3&c=9">3</option>
    </select>`);
    expect(pageUrls(root, base)).toEqual([base, `${base}&page=2`, `${base}&page=3`]);
  });
  it('keeps native actions, escapes no content into HTML, and excludes unreadable entries', () => {
    const books = extractBooks(parse(card('1', '&lt;script&gt;') + '<div class="readerBooks"></div>'), base);
    expect(books).toHaveLength(1);
    expect(books[0]?.name).toBe('<script>');
    expect(books[0]?.readerUrl).toBe('https://www.bookwalker.com.tw/browserViewer/1/read');
    expect(books[0]?.siteActions[0]?.label).toBe('加入書單');
  });
  it('rejects unsafe reader URLs and uses no bogus cover URL when the image is absent', () => {
    expect(extractBooks(parse(card('1').replace('/browserViewer/1/read', 'https://evil.test/browserViewer/1/read')), base)).toEqual([]);
    expect(extractBooks(parse(card('1').replace('https://example.com/cover.jpg', '')), base)[0]?.coverUrl).toBe('');
  });
});

describe('cross-page catalog', () => {
  it('uses the current default-shelf document and fetches subsequent /all pages', async () => {
    const root = parse(toolbar + card('1') + `<select class="pageNumSelect">
      <option value="/bookcase/available_book_list/all?page=1">1</option>
      <option value="/bookcase/available_book_list/all?page=2">2</option>
    </select>`);
    const fetchPage = vi.fn<typeof fetch>(async () => new Response(toolbar + card('2')));
    await expect(new Catalog(root, 'https://www.bookwalker.com.tw/bookcase/available_book_list', fetchPage).get()).resolves.toHaveLength(2);
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage.mock.calls[0]?.[0]).toBe('https://www.bookwalker.com.tw/bookcase/available_book_list/all?page=2');
  });

  it('calls the default fetch with the browser global as its receiver', async () => {
    const root = parse(toolbar + card('1') + `<select class="pageNumSelect"><option value="${base}&page=2">2</option></select>`);
    const nativeLikeFetch = vi.fn<typeof fetch>(async function (this: unknown) {
      if (this !== globalThis) throw new TypeError('Illegal invocation');
      return new Response(toolbar + card('2'));
    });
    vi.stubGlobal('fetch', nativeLikeFetch);
    try {
      await expect(new Catalog(root, base).get()).resolves.toHaveLength(2);
      expect(nativeLikeFetch).toHaveBeenCalledTimes(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it('deduplicates uneven pages and caches completed results', async () => {
    const root = parse(toolbar + card('1') + `<select class="pageNumSelect"><option value="${base}&page=2">2</option></select>`);
    const fetchPage = vi.fn<typeof fetch>().mockResolvedValue(new Response(toolbar + card('1') + card('2') + card('3')));
    const catalog = new Catalog(root, base, fetchPage);
    const books = await catalog.get();
    expect(books.map((book) => book.id)).toEqual(['1', '2', '3']);
    expect(chooseBook(books, () => 0)?.id).toBe('1');
    expect(chooseBook(books, () => 0.5)?.id).toBe('2');
    expect(chooseBook(books, () => 0.999)?.id).toBe('3');
    await catalog.get();
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
  it('returns an empty catalog for an empty shelf', async () => {
    const books = await new Catalog(parse(toolbar), base).get();
    expect(books).toEqual([]);
    expect(chooseBook(books)).toBeUndefined();
  });
  it('retries failed pages instead of caching the failure or drawing from partial results', async () => {
    const root = parse(toolbar + card('1') + `<select class="pageNumSelect"><option value="${base}&page=2">2</option></select>`);
    const fetchPage = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response(toolbar + card('2')));
    const catalog = new Catalog(root, base, fetchPage);
    await expect(catalog.get()).rejects.toThrow('HTTP 503');
    await expect(catalog.get()).resolves.toHaveLength(2);
  });
  it('rejects login pages instead of treating them as an empty page', async () => {
    const root = parse(toolbar + `<select class="pageNumSelect"><option value="${base}&page=2">2</option></select>`);
    const fetchPage = vi.fn<typeof fetch>().mockResolvedValue(new Response('<form>Login</form>'));
    await expect(new Catalog(root, base, fetchPage).get()).rejects.toThrow('登入狀態');
  });
});
