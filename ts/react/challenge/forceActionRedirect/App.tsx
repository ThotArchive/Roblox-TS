import React from 'react';
import { WithTranslationsProps } from 'react-utilities';
import ForceActionRedirect from './containers/forceActionRedirect';
import { ForceActionRedirectChallengeConfig, OnModalChallengeAbandonedCallback } from './interface';
import { ForceActionRedirectContextProvider } from './store/contextProvider';

type Props = {
  forceActionRedirectChallengeConfig: ForceActionRedirectChallengeConfig;
  renderInline: boolean;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
} & WithTranslationsProps;

const App: React.FC<Props> = ({
  renderInline,
  forceActionRedirectChallengeConfig,
  translate,
  onModalChallengeAbandoned
}: Props) => {
  return (
    <ForceActionRedirectContextProvider
      renderInline={renderInline}
      forceActionRedirectChallengeConfig={forceActionRedirectChallengeConfig}
      translate={translate}
      onModalChallengeAbandoned={onModalChallengeAbandoned}>
      <ForceActionRedirect />
    </ForceActionRedirectContextProvider>
  );
};

export default App;
