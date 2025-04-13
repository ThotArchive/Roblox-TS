import React, { useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { TEssentialCookie } from '../types/cookiePolicyTypes';
import ConsentTool from '../containers/ConsentTool';

interface IConsentToolService {
  open: () => void;
  close: () => void;
}
export const useConsentTools = ({
  nonEssentialCookieList,
  essentialCookieList,
  translate,
  onCloseConsentTool
}: {
  nonEssentialCookieList: string[];
  essentialCookieList: TEssentialCookie[];
  translate: TranslateFunction;
  onCloseConsentTool?: React.Dispatch<React.SetStateAction<string | null>>;
}): [JSX.Element, IConsentToolService] => {
  const [consentToolOpen, setConsentToolOpen] = useState(false);
  const consentToolService: IConsentToolService = {
    open: () => setConsentToolOpen(true),
    close: () => setConsentToolOpen(false)
  };

  const consentTool = consentToolOpen ? (
    <ConsentTool
      translate={translate}
      essentialCookieList={essentialCookieList}
      nonEssentialCookieList={nonEssentialCookieList}
      closeConsentTool={param => {
        consentToolService.close();
        onCloseConsentTool?.(param);
      }}
    />
  ) : (
    <div />
  );
  return [consentTool, consentToolService];
};

export default useConsentTools;
