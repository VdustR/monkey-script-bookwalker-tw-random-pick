// Run only in a disposable BOOKWALKER bookshelf tab before taking documentation screenshots.
// This changes displayed data and shelf-fetch responses, never the account's stored library.
(() => {
  const titles = ['星光郵便局', '雨後的圖書館', '山海之間', '週末咖啡筆記', '月光列車', '小島散步日記'];
  const colors = ['#334e68', '#556b58', '#8a6448', '#725a78', '#596875', '#a1764d'];
  const cover = (index) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="295" viewBox="0 0 200 295"><rect width="200" height="295" fill="${colors[index % colors.length]}"/><circle cx="150" cy="70" r="38" fill="#f1e7ce" opacity=".7"/><path d="M0 210L65 150L130 210L175 160L200 200V295H0Z" fill="#e4d8c2" opacity=".25"/><text x="22" y="120" fill="white" font-size="19" font-family="sans-serif">${titles[index % titles.length]}</text><text x="22" y="252" fill="white" font-size="11" font-family="sans-serif">FICTIONAL SAMPLE · ${index + 1}</text></svg>`);
  const cards = [...document.querySelectorAll('.readerBooks')];
  cards.forEach((card, index) => {
    const id = String(900000 + index);
    const image = card.querySelector('img');
    if (image) {
      image.removeAttribute('srcset'); image.removeAttribute('data-src');
      image.src = cover(index); image.alt = titles[index % titles.length];
    }
    card.querySelectorAll('a').forEach(a => { a.href = `https://www.bookwalker.com.tw/browserViewer/${id}/read`; });
    card.querySelectorAll('input').forEach(input => { input.value = id; input.checked = false; });
    card.querySelectorAll('[data-products]').forEach(item => { item.setAttribute('data-products', `[${id}]`); });
    const info = card.querySelector('[data-action*="display_book_info"]');
    if (info) for (const [key, value] of Object.entries({ product_image: cover(index), product_name: titles[index % titles.length], author: '範例作者', category: '文學', vendor: '範例出版社', publish_at: '2025-01-01', buy_at: '2025-06-01', last_read: '' })) info.setAttribute(`data-${key}`, value);
    card.querySelectorAll('.readerBookPercent').forEach(e => { e.textContent = '0%'; });
  });
  [...document.querySelectorAll('a[href*="browserViewer"]')].filter(a => !a.closest('.readerBooks')).forEach((a, index) => {
    a.href = `https://www.bookwalker.com.tw/browserViewer/${900000 + index}/read`;
    a.replaceChildren(Object.assign(document.createElement('span'), { className: 'recentBookNum', textContent: '0' }), document.createTextNode(titles[index % titles.length]));
  });
  document.querySelectorAll('.topMember img').forEach(img => {
    img.removeAttribute('data-src'); img.removeAttribute('srcset');
    img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#ddd"/><circle cx="40" cy="28" r="14" fill="#999"/><path d="M14 74a26 26 0 0 1 52 0" fill="#999"/></svg>');
  });
  document.querySelectorAll('.topIconNum').forEach(e => { e.textContent = '0'; });
  // Return a synthetic second page while preserving the real site's layout and selectors.
  const options = document.querySelectorAll('.pageNumSelect option');
  options.forEach((option, index) => { if (index > 1) option.remove(); });
  const second = document.cloneNode(true);
  second.querySelectorAll('.readerBooks').forEach((card, index) => {
    if (index > 5) { card.remove(); return; }
    const id = String(910000 + index);
    card.querySelectorAll('a').forEach(a => { a.href = `https://www.bookwalker.com.tw/browserViewer/${id}/read`; });
    card.querySelectorAll('input').forEach(input => { input.value = id; });
    card.querySelectorAll('[data-products]').forEach(item => { item.setAttribute('data-products', `[${id}]`); });
  });
  const shelfHtml = second.documentElement.outerHTML;
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, location.href).pathname === location.pathname
    ? Promise.resolve(new Response(shelfHtml, { headers: { 'Content-Type': 'text/html' } }))
    : originalFetch(input, init);
  // A fixed choice keeps the documentation reproducible. Do not use this in production.
  Math.random = () => 0;
})();
