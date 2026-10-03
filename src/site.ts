import type { SiteAction } from './catalog';

export const anchorSelector = '#bw_user > div > div.rwdWrapper2.rwdWrapperFull.areaFlex > div.rwdMain > div.readerSettingBox > div:nth-child(1) > div:nth-child(5)';

export function triggerSiteAction(action: SiteAction, close: () => void): void {
  const controller = document.querySelector('[data-controller~="bookcase"]');
  if (!controller) throw new Error('找不到網站的書櫃操作元件，請重新整理後再試。');
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.hidden = true;
  for (const [name, value] of action.attributes) {
    if (name.startsWith('data-')) trigger.setAttribute(name, value);
  }
  controller.append(trigger);
  close();
  // Let the site's controller connect after insertion and the modal release focus.
  setTimeout(() => {
    trigger.click();
    setTimeout(() => { trigger.remove(); }, 1_000);
  }, 0);
}
