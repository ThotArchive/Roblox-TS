import { uuidService } from 'core-utilities';
import React, { createContext, useContext, useState } from 'react';
import { parseQueryString } from './parsingUtils';

export const PageSessionContext = createContext('');

export const PageSessionProvider: React.FC = ({ children }) => {
  const paramString = window.location.href?.split('?')[1];
  const urlParams = paramString && parseQueryString(paramString);
  const referredSession =
    urlParams && (urlParams.discoverPageSessionInfo || urlParams.homePageSessionInfo);
  const [session] = useState(
    referredSession && typeof referredSession === 'string'
      ? referredSession
      : uuidService.generateRandomUuid()
  );
  return <PageSessionContext.Provider value={session}>{children}</PageSessionContext.Provider>;
};

type WithPageSession = <P>(WrappedComponent: React.FC<P>) => React.FC<P>;

export const withPageSession: WithPageSession = <P,>(Component: React.FC<P>) => {
  const WrappedComponent = (props: React.PropsWithChildren<P>) => {
    return (
      <PageSessionProvider>
        <Component {...props} />
      </PageSessionProvider>
    );
  };

  return WrappedComponent;
};

export const usePageSession = (): string => {
  return useContext(PageSessionContext);
};
