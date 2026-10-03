import { mount } from 'svelte';
import App from './App.svelte';
import { anchorSelector } from './site';

if (!document.getElementById('bookwalker-random-book-button')) {
  const anchor = document.querySelector(anchorSelector);
  const toolbar = document.querySelector('.readerSettingBox .readerSettingColumn');
  if (toolbar) {
    const target = document.createElement('div');
    target.className = 'bw-random-mount';
    if (anchor) anchor.insertAdjacentElement('afterend', target);
    else toolbar.append(target);
    mount(App, { target });
  }
}
