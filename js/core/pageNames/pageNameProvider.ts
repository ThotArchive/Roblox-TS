import PageNames from './pageNames';

class PageNameProvider {
    private static internalPageName: string;

    static getInternalPageName(): string {
        if (!PageNameProvider.internalPageName) {
            const metaTag: any = document.querySelector('meta[name="page-meta"]');
            if (metaTag && metaTag.dataset && metaTag.dataset.internalPageName) {
                PageNameProvider.internalPageName = metaTag.dataset.internalPageName;
            }
        }
        return PageNameProvider.internalPageName;
    }

    static setInternalPageName(pageName: string): void {
        const metaTag: any = document.querySelector('meta[name="page-meta"]');
        if (metaTag && metaTag.dataset && metaTag.dataset.internalPageName) {
            metaTag.dataset.internalPageName = pageName;
        }
        PageNameProvider.internalPageName = pageName;
    }

    static isLandingPage = (): boolean => {
        const pageName = PageNameProvider.getInternalPageName();
        return pageName === PageNames.Landing
            || pageName === PageNames.RollerCoaster;
    }
};

export default {
    PageNames,
    PageNameProvider
};