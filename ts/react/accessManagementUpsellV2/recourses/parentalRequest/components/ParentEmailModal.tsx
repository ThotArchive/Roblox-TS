import React, { useEffect } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import useParentEmailModal from '../hooks/useParentEmailModal';
import RequestType from '../enums/RequestType';

const ParentEmailModal = ({
  translate,
  consentType,
  successCallback,
  onHidecallback,
  value
}: {
  translate: WithTranslationsProps['translate'];
  consentType: RequestType;
  successCallback: (sessionId: string, newParentEmail?: string, emailNotSent?: boolean) => any;
  onHidecallback: () => any;
  value: Record<string, unknown> | null;
}): JSX.Element => {
  const [parentEmailModal, parentEmailModalService] = useParentEmailModal(
    translate,
    consentType,
    successCallback,
    onHidecallback,
    value
  );
  useEffect(() => {
    parentEmailModalService.open();
  }, []);
  return <React.Fragment>{parentEmailModal}</React.Fragment>;
};

export default ParentEmailModal;
