import React, { useEffect, useState, useMemo } from 'react';
import { TranslateFunction } from 'react-utilities';
import parentalRequestService from '../services/parentalRequestService';
import useModal from '../../../hooks/useModal';
import parentalRequestConstants from '../constants/parentalRequestConstants';
import parentalRequestInlineErrorHandler, {
  ParentalRequestError
} from '../utils/parentalRequestErrorHandler';
import ParentalRequestErrorReason from '../enums/ParentalRequestErrorReason';
import { sendLoadRequestBroadcastEvent } from '../services/eventService';
import RequestType from '../enums/RequestType';
import changeBirthdayUtils from '../utils/changeBirthdayUtils';

const ParentalRequestBroadcast = ({
  translate,
  consentType,
  successCallBack,
  onHideCallback,
  value = null
}: {
  translate: TranslateFunction;
  consentType: RequestType;
  successCallBack: (sessionIde: string, newEmail?: string, emailNotSent?: boolean) => void;
  onHideCallback: () => void;
  value: Record<string, unknown> | null;
}): JSX.Element => {
  const [errorMessage, setErrorMessage] = useState<string>(
    parentalRequestConstants.translationKeys.gatherParentEmail.unknownError
  );
  const { emailSentConfirmation } = parentalRequestConstants.translationKeys;

  const [errorModal, errorModalService] = useModal({
    translate,
    title: translate(parentalRequestConstants.translationKeys.gatherParentEmail.unknownError),
    body: <p>{translate(errorMessage)}</p>,
    actionButtonTranslateKey: emailSentConfirmation.btnText,
    onAction: () => {
      setErrorMessage('');
      errorModalService.close();
      onHideCallback();
    },
    onHide: onHideCallback
  });
  const settingName = useMemo(() => {
    if (consentType === RequestType.UpdateUserSetting) {
      return Object.keys(value)[0];
    }
    return undefined;
  }, [consentType, value]);

  const broadcastHandler = async () => {
    try {
      const response = await parentalRequestService.sendRequestToAllParents({
        requestType: consentType,
        requestDetails: value
      });
      const newBirthdateString = value?.newBirthdate as string;
      const newBirthdate = new Date(newBirthdateString);
      const state =
        consentType === RequestType.UpdateBirthdate
          ? changeBirthdayUtils.getAgeRange(newBirthdate)
          : undefined;
      sendLoadRequestBroadcastEvent({
        requestType: consentType,
        extraState: state,
        sessionId: response.sessionId,
        settingName
      });
      successCallBack(response.sessionId);
    } catch (e) {
      const error = e as ParentalRequestError;

      const errorReason = parentalRequestInlineErrorHandler(
        error.data.code as ParentalRequestErrorReason
      );
      if (errorReason === ParentalRequestErrorReason.SenderFloodedRequestCreated) {
        successCallBack(error.data.sessionId, undefined, true);
      } else {
        setErrorMessage(errorReason);
        errorModalService.open();
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line no-void
    void broadcastHandler();
  }, []);
  return <div>{errorModal}</div>;
};

export default ParentalRequestBroadcast;
