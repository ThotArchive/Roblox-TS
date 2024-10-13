export default class LoadingOverlay {
  private overlayDiv: HTMLDivElement | null = null;

  private contentDiv: HTMLDivElement | null = null;

  private loadingMessageSpan: HTMLSpanElement | null = null;

  private spinnerSpan: HTMLSpanElement | null = null;

  private readonly loadingOverlayElementId: string = 'loading-overlay';

  private _loadingMessage: string | undefined;

  public show = (message?: string | undefined): LoadingOverlay => {
    const overlayDiv = this.getOrCreateOverlayDiv();
    const contentDiv = this.getOrCreateContentDiv(overlayDiv);
    this.getOrCreateSpinnerSpan(contentDiv);
    this.updateOrCreateMessage(message);

    return this;
  };

  public hide = () => {
    this.spinnerSpan?.parentNode?.removeChild(this.spinnerSpan);
    this.loadingMessageSpan?.parentNode?.removeChild(this.loadingMessageSpan);
    this.contentDiv?.parentNode?.removeChild(this.contentDiv);
    this.overlayDiv?.parentNode?.removeChild(this.overlayDiv);
    this.overlayDiv = null;
    this.contentDiv = null;
    this.spinnerSpan = null;
    this.loadingMessageSpan = null;
  };

  public updateMessage = (message?: string | undefined): void => {
    this._loadingMessage = message;
    this.updateOrCreateMessage(message);
  };

  public get loadingMessage() {
    return this._loadingMessage;
  }

  private updateOrCreateMessage = (message?: string | undefined): void => {
    if (!this.overlayDiv) {
      return;
    }
    if (!message) {
      this.loadingMessageSpan?.parentNode?.removeChild(this.loadingMessageSpan);
      this.loadingMessageSpan = null;
      return;
    }
    if (this.loadingMessageSpan) {
      this.loadingMessageSpan.innerText = message;
    } else {
      const messageSpan = document.createElement('span');
      messageSpan.innerText = message;
      messageSpan.classList.add('loading-message');
      this.getOrCreateContentDiv(this.overlayDiv).appendChild(messageSpan);
      this.loadingMessageSpan = messageSpan;
    }
  };

  private getOrCreateContentDiv = (overlayDiv: HTMLDivElement): HTMLDivElement => {
    if (this.contentDiv) {
      return this.contentDiv;
    }

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('loading-overlay-content');
    this.contentDiv = contentDiv;
    overlayDiv.appendChild(contentDiv);
    return contentDiv;
  };

  private getOrCreateOverlayDiv = (): HTMLDivElement => {
    if (this.overlayDiv) {
      return this.overlayDiv;
    }

    const overlayDivPreExisting = document.getElementById(this.loadingOverlayElementId) as
      | HTMLDivElement
      | undefined;
    if (overlayDivPreExisting) {
      this.overlayDiv = overlayDivPreExisting;
      return overlayDivPreExisting;
    }

    const overlayDiv = document.createElement('div');
    this.overlayDiv = overlayDiv;
    overlayDiv.id = this.loadingOverlayElementId;
    overlayDiv.classList.add('loading-overlay');
    document.body.appendChild(overlayDiv);
    return overlayDiv;
  };

  private getOrCreateSpinnerSpan = (contentDiv: HTMLDivElement): HTMLSpanElement => {
    if (this.spinnerSpan) {
      return this.spinnerSpan;
    }
    const spinnerSpan = document.createElement('span');
    spinnerSpan.classList.add('spinner', 'spinner-default');
    contentDiv.appendChild(spinnerSpan);
    this.spinnerSpan = spinnerSpan;
    return spinnerSpan;
  };
}
