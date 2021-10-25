import { Page } from 'playwright';

export function appendMarker(page: Page) {
  return page.evaluate(() => {
    const startMarker = document.querySelector<HTMLElement>('[vo-mark="start"]');
    if (!startMarker) {
      document.head.insertAdjacentHTML('beforeend', `<style>
        [vo-mark]:not(:focus):not(:active) {
          clip: rect(0 0 0 0); 
          clip-path: inset(50%);
          height: 1px;
          overflow: hidden;
          position: absolute;
          white-space: nowrap; 
          width: 1px;
        }
      </style>`);
      const start = document.createElement('h2');
      start.innerHTML = 'vo-start';
      start.setAttribute('vo-mark', 'start');
      document.querySelector('body').prepend(start);
    }
  });
}