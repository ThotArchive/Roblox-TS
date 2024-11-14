import React, { useState, useEffect, useMemo } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { parentalRequestTranslationConfig } from '../../app.config';
import { Recourse } from '../../enums';
import ParentalRequestBroadcast from './components/ParentalRequestBroadcast';
import useModal from '../../hooks/useModal';
import parentalRequestConstants from './constants/parentalRequestConstants';
import ParentEmailModal from './components/ParentEmailModal';
import { RecourseResponse } from '../../types/AmpTypes';
import { sendClickRequestBroadcastConfirmEvent } from './services/eventService';
import userSettingsService from './services/userSettingsService';
import RequestType from './enums/RequestType';

import changeBirthdayUtils from './utils/changeBirthdayUtils';

const ParentalRequestContainer = ({
  translate,
  recourse,
  onHidecallback,
  value = null
}: {
  translate: WithTranslationsProps['translate'];
  recourse: RecourseResponse;
  onHidecallback: () => void;
  value: Record<string, string> | null;
}): JSX.Element => {
  const { emailSentConfirmation } = parentalRequestConstants.translationKeys;
  const { action: recourseAction, parentConsentTypes } = recourse;
  const consentType = parentConsentTypes?.[0];
  const [parentEmail, setParentEmail] = useState<string[]>([]);
  const [isEmailSent, setIsEmailSent] = useState<boolean>(true);

  const oneParentSuccessMessage = (
    <p
      dangerouslySetInnerHTML={{
        __html: translate(emailSentConfirmation.oneParentBody, {
          parentEmail: parentEmail[0]
        })
      }}
    />
  );
  const multipleParentSuccessMessage = <p>{translate(emailSentConfirmation.pluralParentBody)}</p>;
  const emailNotSentSuccessMessage = <p>{translate(emailSentConfirmation.emailNotSentBody)}</p>;
  const confirmationMessage = useMemo(() => {
    if (!isEmailSent) {
      return emailNotSentSuccessMessage;
    }
    return parentEmail.length === 1 ? oneParentSuccessMessage : multipleParentSuccessMessage;
  }, [isEmailSent, parentEmail]);

  const [confirmationModal, confirmationModalService] = useModal({
    translate,
    title: translate(emailSentConfirmation.title),
    body: confirmationMessage,
    actionButtonTranslateKey: emailSentConfirmation.btnText,
    onAction: () => {
      confirmationModalService.close();
      onHidecallback();
    },
    onHide: onHidecallback
  });
  const getLinkedParentEmails = async () => {
    await userSettingsService.getLinkedParentEmails().then(response => {
      setParentEmail(response.parentEmails);
    });
  };
  useEffect(() => {
    if (recourseAction === Recourse.ParentConsentRequest) {
      // eslint-disable-next-line no-void
      void getLinkedParentEmails();
    }
  }, [recourseAction]);
  const successCallBack = (sessionId: string, newParentEmail?: string, emailNotSent?: boolean) => {
    if (newParentEmail) {
      setParentEmail([newParentEmail]);
    }
    if (emailNotSent) {
      setIsEmailSent(false);
    }
    confirmationModalService.open();
    switch (consentType) {
      case RequestType.UpdateBirthdate: {
        const newBirthdateString = value?.newBirthdate;
        const newBirthdate = new Date(newBirthdateString);
        const state = changeBirthdayUtils.getAgeRange(newBirthdate);
        sendClickRequestBroadcastConfirmEvent({
          requestType: RequestType.UpdateBirthdate,
          extraState: state,
          sessionId
        });
        break;
      }
      case RequestType.UpdateUserSetting: {
        const settingName = Object.keys(value)[0];
        sendClickRequestBroadcastConfirmEvent({
          requestType: RequestType.UpdateUserSetting,
          settingName,
          sessionId
        });
        break;
      }
      // TODO: Migrate other request type when we kill wizard VPC
      default:
    }
  };
  return (
    <div>
      {recourseAction === Recourse.ParentConsentRequest && (
        <ParentalRequestBroadcast
          translate={translate}
          consentType={consentType}
          successCallBack={successCallBack}
          onHideCallback={onHidecallback}
          value={value}
        />
      )}
      {recourseAction === Recourse.ParentLinkRequest && (
        <ParentEmailModal
          translate={translate}
          consentType={consentType}
          successCallback={successCallBack}
          onHidecallback={onHidecallback}
          value={value}
        />
      )}
      {confirmationModal}
    </div>
  );
};

export default withTranslations(ParentalRequestContainer, parentalRequestTranslationConfig);
