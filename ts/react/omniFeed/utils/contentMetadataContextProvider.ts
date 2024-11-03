import { createContext, useContext } from 'react';
import { TOmniRecommendationsContentMetadata } from '../../common/types/bedev2Types';

type TContentMetadataContext = {
  contentMetadata: TOmniRecommendationsContentMetadata | null;
  appendContentMetadata: (additionalMetadata: TOmniRecommendationsContentMetadata) => void;
};

const ContentMetadataContext = createContext<TContentMetadataContext>({
  contentMetadata: null,
  appendContentMetadata: () => undefined
});

const useContentMetadata = (): TContentMetadataContext => {
  const { contentMetadata, appendContentMetadata } = useContext(ContentMetadataContext);

  return { contentMetadata, appendContentMetadata };
};

export { ContentMetadataContext, useContentMetadata };
