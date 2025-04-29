// Do not import anything here without considering if you need to update the rspack.config.js

const userDataset = (): DOMStringMap | null => {
  const metaTag = document.querySelector<HTMLMetaElement>('meta[name="user-data"]');
  return metaTag?.dataset ?? null;
};

export const isAuthenticated = (): boolean => userDataset() != null;

export const userId = (): number | null => {
  const id = userDataset()?.userid;
  if (id == null) {
    return null;
  }
  const userId = Number.parseInt(id, 10);
  return Number.isNaN(userId) ? null : userId;
};

export const name = (): string | null => userDataset()?.name ?? null;

export const displayName = (): string | null => userDataset()?.displayname ?? null;

export const createdDateTime = (): string | null => userDataset()?.created ?? null;

export const isUnder13 = (): boolean => userDataset()?.isunder13 === "true";

export const isPremiumUser = (): boolean => userDataset()?.ispremiumuser === "true";

export type AuthenticatedUser = {
  isAuthenticated: true;
  id: number | null;
  name: string | null;
  displayName: string | null;
  created: string | null;
  isUnder13: boolean;
  isPremiumUser: boolean;
};

export const authenticatedUser = (): AuthenticatedUser | null => {
  const dataset = userDataset();
  if (dataset == null) {
    return null;
  }
  const id = dataset.userid == null ? null : Number.parseInt(dataset.userid, 10);
  return {
    isAuthenticated: true,
    id: Number.isNaN(id) ? null : id,
    name: dataset.name ?? null,
    displayName: dataset.displayname ?? null,
    created: dataset.created ?? null,
    isUnder13: dataset.isunder13 === "true",
    isPremiumUser: dataset.ispremiumuser === "true",
  };
};
