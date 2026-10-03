<script lang="ts">
  import { tick } from 'svelte';
  import { Catalog, chooseBook } from './catalog';
  import type { Book, SiteAction } from './catalog';
  import { triggerSiteAction } from './site';

  type Result = { kind: 'idle' } | { kind: 'loading' } | { kind: 'book'; book: Book; count: number }
    | { kind: 'empty' } | { kind: 'error'; message: string };
  let result = $state<Result>({ kind: 'idle' });
  let busy = $state(false);
  let copyStatus = $state('');
  let imageFailed = $state(false);
  let dialog: HTMLDialogElement | undefined = $state();
  const shelf = document.querySelector('.readerTitle')?.textContent.trim() || '目前書櫃';
  const catalog = new Catalog(document, location.href);
  const details = $derived(result.kind === 'book' ? [
    ['類別', result.book.category], ['出版社', result.book.publisher],
    ['出版日期', result.book.publishAt], ['購買日期', result.book.buyAt],
    ['最後閱讀', result.book.lastRead],
  ].filter((entry) => entry[1]) : []);

  function close(): void { dialog?.close(); }

  async function draw(): Promise<void> {
    if (busy) return;
    busy = true;
    copyStatus = '';
    if (result.kind !== 'book') result = { kind: 'loading' };
    await tick();
    if (dialog && !dialog.open) dialog.showModal();
    try {
      const books = await catalog.get();
      const book = chooseBook(books);
      imageFailed = false;
      result = book ? { kind: 'book', book, count: books.length } : { kind: 'empty' };
    } catch (error: unknown) {
      result = { kind: 'error', message: error instanceof Error ? error.message : '載入失敗，請重試。' };
    } finally {
      busy = false;
    }
  }

  async function copy(): Promise<void> {
    if (result.kind !== 'book') return;
    const book = result.book;
    try {
      await navigator.clipboard.writeText(`${book.name}\n作者：${book.author}\n${book.readerUrl}`);
      copyStatus = '已複製書籍資訊';
    } catch {
      copyStatus = '無法複製，請檢查瀏覽器的剪貼簿權限。';
    }
  }

  function siteAction(action: SiteAction): void {
    try { triggerSiteAction(action, close); }
    catch (error: unknown) {
      result = { kind: 'error', message: error instanceof Error ? error.message : '操作失敗，請重新整理。' };
    }
  }
</script>

{#snippet dice()}
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M7.5 7.5h.01M16.5 7.5h.01M12 12h.01M7.5 16.5h.01M16.5 16.5h.01" stroke-width="3" stroke-linecap="round" />
  </svg>
{/snippet}

<button id="bookwalker-random-book-button" class="toolbar readerSetBtn" type="button"
  title="從目前的書櫃分類或自訂書單隨機選書" aria-label="從目前書櫃隨機選書"
  disabled={busy} onclick={() => { void draw(); }}>
  {@render dice()}
</button>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog id="bookwalker-random-book-dialog" bind:this={dialog} aria-labelledby="bw-random-heading"
  onclick={(event) => { if (event.target === dialog) close(); }}>
  <header>
    <h2 id="bw-random-heading">隨機閱讀</h2>
    <button class="close" type="button" onclick={close} aria-label="關閉">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m6 6 12 12M18 6 6 18" /></svg>
    </button>
  </header>
  <p class="scope">{shelf}{#if result.kind === 'book'}<span>共 {result.count} 本</span>{/if}</p>
  {#if result.kind === 'book'}
    <section class="book" aria-busy={busy}>
      <div class="cover">
        {#if result.book.coverUrl && !imageFailed}
          <img src={result.book.coverUrl} alt={`${result.book.name} 封面`} onerror={() => { imageFailed = true; }} />
        {:else}<span>無封面圖片</span>{/if}
      </div>
      <div class="info">
        <h3>{result.book.name}</h3>
        <p class="author">{result.book.author}</p>
        <dl>
          {#each details as entry}<div><dt>{entry[0]}</dt><dd>{entry[1]}</dd></div>{/each}
        </dl>
      </div>
    </section>
    <footer>
      <div class="primary-actions">
        <a class="primary" href={result.book.readerUrl} target="_blank" rel="noopener noreferrer">
          開始閱讀
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 4h6v6M20 4l-9 9M10 4H4v16h16v-6" /></svg>
          <span class="sr-only">（開啟新分頁）</span>
        </a>
        <button type="button" disabled={busy} onclick={() => { void draw(); }}>{@render dice()}{busy ? '抽選中…' : '重骰'}</button>
      </div>
      <div class="secondary-actions">
        <button type="button" onclick={() => { void copy(); }}>複製書籍資訊</button>
        {#each result.book.siteActions as action}<button type="button" onclick={() => { siteAction(action); }}>{action.label}</button>{/each}
      </div>
      <p class="feedback" role="status">{copyStatus}</p>
    </footer>
  {:else}
    <section class="message" aria-live="polite" aria-busy={busy}>
      {#if result.kind === 'loading'}
        <p>正在整理書櫃的全部分頁…</p><p class="hint">完成後會從所有可閱讀書籍中隨機選一本。</p>
      {:else if result.kind === 'empty'}
        <h3>這個書櫃沒有可閱讀的書籍</h3><p>請切換其他書櫃分類或自訂書單後再試。</p>
      {:else if result.kind === 'error'}
        <h3>無法載入書櫃</h3><p>{result.message}</p>
        <button type="button" disabled={busy} onclick={() => { void draw(); }}>重新嘗試</button>
      {/if}
    </section>
  {/if}
</dialog>

<style>
  :global(.bw-random-mount) { display: contents; }
  .toolbar { display: inline-flex; align-items: center; justify-content: center; padding: 0; font: inherit; color: inherit; background: #fff; cursor: pointer; }
  svg { width: 20px; height: 20px; flex: none; }
  dialog { --accent: #80563d; --ink: #333; --muted: #666; --line: #e6dfda; border: 0; border-radius: 6px; padding: 20px 24px 16px; width: min(600px, calc(100vw - 32px)); max-width: none; max-height: calc(100dvh - 32px); box-sizing: border-box; overflow: auto; background: #fff; color: var(--ink); font: 14px/1.5 Arial, "Microsoft JhengHei", sans-serif; box-shadow: 0 12px 40px #0004; scrollbar-color: #b6a79e #faf8f6; }
  dialog::backdrop { background: #211c18a6; }
  dialog[open] { animation: reveal 180ms cubic-bezier(.16,1,.3,1); }
  @keyframes reveal { from { clip-path: inset(0 0 8% 0); } to { clip-path: inset(0); } }
  header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  h2 { margin: 0; font-size: 18px; font-weight: 700; line-height: 1.4; color: var(--accent); }
  .close { border: 0; padding: 8px; margin: -6px -8px -6px 0; background: transparent; color: var(--muted); }
  .scope { margin: 4px 0 18px; color: var(--muted); display: flex; flex-wrap: wrap; gap: 8px 16px; }
  .scope span { font-variant-numeric: tabular-nums; }
  .book { display: grid; grid-template-columns: 144px minmax(0, 1fr); gap: 20px; align-items: start; }
  .cover { display: grid; place-items: center; min-height: 180px; background: #f7f4f1; color: var(--muted); }
  img { display: block; width: 100%; max-height: 230px; object-fit: contain; }
  h3 { margin: 0 0 6px; font-size: 19px; line-height: 1.5; font-weight: 700; overflow-wrap: anywhere; text-wrap: pretty; }
  .author { color: var(--muted); margin: 0 0 14px; overflow-wrap: anywhere; }
  dl { margin: 0; font-size: 13px; }
  dl div { display: grid; grid-template-columns: 60px minmax(0, 1fr); gap: 8px; margin: 4px 0; }
  dt { color: var(--muted); }
  dd { margin: 0; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
  footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--line); }
  .primary-actions, .secondary-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  button, a { box-sizing: border-box; font: inherit; cursor: pointer; }
  dialog button, dialog a { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 40px; padding: 8px 14px; border: 1px solid #b9aaa0; border-radius: 3px; background: #fff; color: var(--accent); text-decoration: none; transition: background-color 150ms ease-out; }
  dialog .close { border: 0; min-width: 40px; padding: 8px; color: var(--muted); }
  dialog .primary { background: var(--accent); color: #fff; border-color: var(--accent); }
  dialog button:hover, dialog a:hover { background: #f5efeb; }
  dialog .primary:hover { background: #68432f; border-color: #68432f; }
  button:disabled { opacity: .55; cursor: wait; }
  button:focus-visible, a:focus-visible { outline: 2px solid #80563d; outline-offset: 3px; }
  .secondary-actions { margin-top: 8px; gap: 0 16px; }
  .secondary-actions button { padding: 6px 0; min-height: 36px; border: 0; background: transparent; text-decoration: underline; text-underline-offset: 4px; font-size: 13px; }
  .secondary-actions button:hover { color: #4e3020; }
  .feedback { margin: 0; color: var(--muted); font-size: 12px; }
  .feedback:not(:empty) { margin-top: 6px; }
  .message { padding: 12px 0 16px; }
  .message p { margin: 8px 0 16px; }
  .hint { color: var(--muted); }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  dialog ::selection { background: #eee0d7; color: #412a1c; }
  @media (max-width: 480px) {
    dialog { padding: 16px; }
    .book { grid-template-columns: 90px minmax(0, 1fr); gap: 14px; }
    .cover { min-height: 120px; }
    img { max-height: 150px; }
    h3 { font-size: 17px; }
    dl div { grid-template-columns: 1fr; gap: 0; margin: 6px 0; }
    .primary-actions a { flex: 1; }
    .secondary-actions button { min-height: 44px; }
  }
  @media (prefers-reduced-motion: reduce) { dialog[open] { animation: none; } dialog button, dialog a { transition: none; } }
</style>
