import React, { useEffect } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import useInfoModal from './useInfoModal';
import { exitModalMessage } from '../constants/commonConstants';
import { VPCRedirect, defaultRedirect } from '../utils/browserUtils';

const useBackButtonHandler = (translate: WithTranslationsProps['translate']): JSX.Element => {
  const [exitModal, exitModalService] = useInfoModal({
    translate,
    titleTranslationKey: exitModalMessage.title,
    bodyTranslationKey: exitModalMessage.body,
    actionButtonTextTranslationKey: exitModalMessage.actionBtnText,
    onAction: VPCRedirect,
    neutralButtonTextTranslationKey: exitModalMessage.neturalBtnText,
    onNeutral: defaultRedirect,
    closeable: false
  });

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // loaded from bf-cache, so need to refetch playability
        // eslint-disable-next-line no-void
        exitModalService.open();
      }
    };
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  return <React.Fragment>{exitModal}</React.Fragment>;
};

export default useBackButtonHandler;
