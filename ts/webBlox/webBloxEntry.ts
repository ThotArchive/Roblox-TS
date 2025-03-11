import * as WebBlox from '@rbx/ui';

declare global {
  interface Window {
    WebBlox: typeof WebBlox;
  }
}

window.WebBlox = WebBlox;
