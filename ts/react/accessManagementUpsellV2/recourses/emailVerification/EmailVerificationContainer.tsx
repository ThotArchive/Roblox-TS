import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { useAppDispatch } from '../../store';
import { emailUpsellTranslationConfig } from '../../app.config';
import {
  fetchFeatureAccess,
  selectAmpFeatureCheckData,
  selectFeatureName
} from '../../accessManagement/accessManagementSlice';
import useEmailInputModal from './hooks/useEmailInputModal';
import { selectEmailVerification } from './emailVerificationSlice';

const EmailVerificationContainer = ({
  translate,
  onHide
}: {
  translate: WithTranslationsProps['translate'];
  onHide: () => void;
}): JSX.Element => {
  const dispatch = useAppDispatch();
  const emailVerificationState = useSelector(selectEmailVerification);
  const featureName = useSelector(selectFeatureName);
  const ampFeatureCheckData = useSelector(selectAmpFeatureCheckData);
  const [emailModal, emailModalService] = useEmailInputModal(translate, onHide);
  useEffect(() => {
    // TODO: implement for different upsells with added emaill and verify email
    emailModalService.open();
  }, []);

  useEffect(() => {
    if (emailVerificationState.error) {
      emailModalService.close();
      onHide();
    }
  }, [emailModalService, emailVerificationState]);

  useEffect(() => {
    if (emailVerificationState.isEmailAdded) {
      emailModalService.close();
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(() => dispatch(fetchFeatureAccess({ featureName, ampFeatureCheckData })), 500);
    }
  }, [emailVerificationState]);
  return <div>{emailModal}</div>;
};

export default withTranslations(EmailVerificationContainer, emailUpsellTranslationConfig);
