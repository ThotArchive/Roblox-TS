/*
 * Internal page names are defined in PageNameProvider.cs in the Website (www).
 * If you want to use specific page names, please add here.
 * We are trying to maintain only page names front-end code needs instead of adding them all.
 */
export enum PageNames {
  RollerCoaster = "RollerCoaster",
  Landing = "Landing",
}

// TODO: old, migrated code
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PageNameProvider {
  private static internalPageName: string;

  // TODO return `PageNames` from this
  static getInternalPageName(): string {
    if (!PageNameProvider.internalPageName) {
      const metaTag = document.querySelector<HTMLElement>('meta[name="page-meta"]');
      if (metaTag?.dataset.internalPageName != null) {
        PageNameProvider.internalPageName = metaTag.dataset.internalPageName;
      }
    }
    return PageNameProvider.internalPageName;
  }

  static setInternalPageName(pageName: string): void {
    const metaTag = document.querySelector<HTMLMetaElement>('meta[name="page-meta"]');
    if (metaTag?.dataset.internalPageName != null) {
      metaTag.dataset.internalPageName = pageName;
    }
    PageNameProvider.internalPageName = pageName;
  }

  static isLandingPage = (): boolean => {
    const pageName = PageNameProvider.getInternalPageName();
    return (
      // TODO: remove `valueOf` once `getInternalPageName` returns `PageNames`
      pageName === PageNames.Landing.valueOf() || pageName === PageNames.RollerCoaster.valueOf()
    );
  };
}
