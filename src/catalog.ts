export interface SiteAction {
  label: string;
  attributes: readonly (readonly [string, string])[];
}

export interface Book {
  id: string;
  readerUrl: string;
  coverUrl: string;
  name: string;
  author: string;
  category: string;
  publisher: string;
  publishAt: string;
  buyAt: string;
  lastRead: string;
  siteActions: SiteAction[];
}

const pageSelector = '.pageNumSelect option';
const readerSelector = 'a[href*="/browserViewer/"][href$="/read"]';

function safeUrl(value: string | null, base: string): string {
  if (!value?.trim()) return '';
  try {
    const url = new URL(value, base);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch {
    return '';
  }
}

export function extractBooks(root: Document, pageUrl: string): Book[] {
  return [...root.querySelectorAll('.readerBooks')].flatMap((card) => {
    const info = card.querySelector('[data-action*="display_book_info"]');
    const readerUrl = safeUrl(card.querySelector(readerSelector)?.getAttribute('href') ?? null, pageUrl);
    if (!info || !readerUrl || new URL(readerUrl).origin !== new URL(pageUrl).origin) return [];
    const value = (name: string): string => info.getAttribute(`data-${name}`)?.trim() ?? '';
    const siteActions = [...card.querySelectorAll('.readerBookMoreMenu li')]
      .filter((item) => !item.getAttribute('data-action')?.includes('display_book_info'))
      .map((item): SiteAction => ({
        label: item.textContent.trim(),
        attributes: [...item.attributes]
          .filter((attribute) => attribute.name.startsWith('data-'))
          .map((attribute): readonly [string, string] => [attribute.name, attribute.value]),
      }))
      .filter((action) => action.label.length > 0 && action.attributes.length > 0);
    return [{
      id: card.querySelector<HTMLInputElement>('input[name="products"]')?.value ?? '',
      readerUrl,
      coverUrl: safeUrl(value('product_image'), pageUrl),
      name: value('product_name') || '未提供書名',
      author: value('author') || '未提供作者',
      category: value('category'), publisher: value('vendor'),
      publishAt: value('publish_at'), buyAt: value('buy_at'), lastRead: value('last_read'),
      siteActions,
    }];
  });
}

export function pageUrls(root: Document, currentUrl: string): string[] {
  const current = new URL(currentUrl);
  current.hash = '';
  // Keep the active shelf and filters; only pagination may differ.
  const urls = new Set([current.href]);
  for (const option of root.querySelectorAll<HTMLOptionElement>(pageSelector)) {
    if (!option.value.trim()) continue;
    let candidate: URL;
    try { candidate = new URL(option.value, current); } catch { continue; }
    if (candidate.origin !== current.origin || candidate.pathname !== current.pathname) continue;
    const page = candidate.searchParams.get('page');
    if (page !== null && !/^\d+$/.test(page)) continue;
    if (page === (current.searchParams.get('page') ?? '1')) continue;
    const url = new URL(current);
    if (page !== null) url.searchParams.set('page', page);
    urls.add(url.href);
  }
  return [...urls];
}

export class Catalog {
  private pending: Promise<Book[]> | undefined;
  private readonly root: Document;
  private readonly currentUrl: string;
  private readonly fetchPage: typeof fetch;
  constructor(
    root: Document,
    currentUrl: string,
    fetchPage: typeof fetch = fetch,
  ) {
    this.root = root;
    this.currentUrl = currentUrl;
    // Native Window.fetch rejects a Catalog instance as its receiver.
    this.fetchPage = fetchPage.bind(globalThis);
  }

  get(): Promise<Book[]> {
    this.pending ??= this.load().catch((error: unknown) => {
      this.pending = undefined;
      throw error;
    });
    return this.pending;
  }

  private async load(): Promise<Book[]> {
    const urls = pageUrls(this.root, this.currentUrl);
    const activeUrl = new URL(this.currentUrl);
    activeUrl.hash = '';
    const books = new Map<string, Book>();
    let nextPage = 0;
    // Bound concurrent requests without biasing the final selection by page size.
    const worker = async (): Promise<void> => {
      while (nextPage < urls.length) {
        const url = urls[nextPage++];
        if (url === undefined) return;
        let root = this.root;
        if (url !== activeUrl.href) {
          const response = await this.fetchPage(url, {
            credentials: 'same-origin', headers: { Accept: 'text/html' },
            signal: AbortSignal.timeout(30_000),
          });
          if (!response.ok) throw new Error(`載入分頁失敗（HTTP ${response.status}），請重試。`);
          if (response.redirected && new URL(response.url).pathname !== new URL(url).pathname) {
            throw new Error('登入或書櫃狀態已變更，請重新整理頁面後再試。');
          }
          root = new DOMParser().parseFromString(await response.text(), 'text/html');
          if (!root.querySelector('.readerSettingBox')) {
            throw new Error('無法辨識書櫃分頁，請確認登入狀態後再試。');
          }
        }
        for (const book of extractBooks(root, url)) books.set(book.id || book.readerUrl, book);
      }
    };
    // Wait for every worker to settle before a failed catalog can be retried.
    const results = await Promise.allSettled(Array.from({ length: Math.min(3, urls.length) }, worker));
    const failed = results.find((result) => result.status === 'rejected');
    if (failed?.status === 'rejected') throw failed.reason;
    return [...books.values()];
  }
}

export function chooseBook(books: readonly Book[], random: () => number = Math.random): Book | undefined {
  return books[Math.floor(random() * books.length)];
}
