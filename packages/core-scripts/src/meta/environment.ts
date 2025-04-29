// Do not import anything here without considering if you need to update the rspack.config.js

const environmentDataset = (): DOMStringMap | null => {
  const metaTag = document.querySelector<HTMLMetaElement>(`meta[name="environment-meta"]`);
  return metaTag?.dataset ?? null;
};

export const isTestSite = (): boolean => environmentDataset()?.isTestingSite === "true";
