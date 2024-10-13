import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { Modal } from 'react-style-guide';
import * as TwoStepVerification from '../../../../common/request/types/twoStepVerification';
import { TwoStepVerificationError } from '../../../../common/request/types/twoStepVerification';
import InlineChallengeBody from '../../../common/inlineChallengeBody';
import {
  mapTwoStepVerificationErrorToChallengeErrorCode,
  mapTwoStepVerificationErrorToResource
} from '../constants/resources';
import { mediaTypeToPath } from '../hooks/useActiveMediaType';
import useTwoStepVerificationContext from '../hooks/useTwoStepVerificationContext';
import { MediaType } from '../interface';
import { TwoStepVerificationActionType } from '../store/action';

type Props = {
  hasSentEmailCode: boolean;
  setHasSentEmailCode: React.Dispatch<React.SetStateAction<boolean>>;
  hasSentSmsCode: boolean;
  setHasSentSmsCode: React.Dispatch<React.SetStateAction<boolean>>;
  requestInFlight: boolean;
  setRequestInFlight: React.Dispatch<React.SetStateAction<boolean>>;
  setModalTitleText: React.Dispatch<React.SetStateAction<string>>;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * A list of available media types to solve the 2SV challenge.
 */
const MediaTypeList: React.FC<Props> = ({
  hasSentEmailCode,
  setHasSentEmailCode,
  hasSentSmsCode,
  setHasSentSmsCode,
  requestInFlight,
  setRequestInFlight,
  setModalTitleText,
  children
}: Props) => {
  const {
    state: {
      userId,
      challengeId,
      actionType,
      renderInline,
      resources,
      requestService,
      enabledMediaTypes
    },
    dispatch
  } = useTwoStepVerificationContext();
  const history = useHistory();

  /*
   * Component State
   */

  const [sendCodeError, setSendCodeError] = useState<string | null>(null);

  /*
   * Event Handlers
   */

  const transitionToMediaType = async (mediaType: MediaType) => {
    if (requestInFlight) {
      return;
    }

    if (mediaType !== MediaType.CrossDevice && enabledMediaTypes.includes(MediaType.CrossDevice)) {
      // Attempt to retract dialog when a user has CD2SV enabled and switches media types, but don't surface any errors.
      await requestService.twoStepVerification.retractCrossDevice(userId, {
        challengeId,
        actionType
      });
    }

    // Automatically send a 2SV email when switching to email code type.
    if (mediaType === MediaType.Email && !hasSentEmailCode) {
      setRequestInFlight(true);

      const result = await requestService.twoStepVerification.sendEmailCode(userId, {
        challengeId,
        actionType
      });
      setRequestInFlight(false);
      if (result.isError) {
        if (
          result.error === TwoStepVerificationError.INVALID_USER_ID ||
          result.error === TwoStepVerificationError.INVALID_CHALLENGE_ID
        ) {
          dispatch({
            type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED,
            errorCode: mapTwoStepVerificationErrorToChallengeErrorCode(result.error)
          });
        } else {
          setSendCodeError(mapTwoStepVerificationErrorToResource(resources, result.error));
        }
        return;
      }

      setHasSentEmailCode(true);
    }

    // Automatically send a 2SV text when switching to SMS code type.
    if (mediaType === MediaType.SMS && !hasSentSmsCode) {
      setRequestInFlight(true);

      const result = await requestService.twoStepVerification.sendSmsCode(userId, {
        challengeId,
        actionType
      });
      setRequestInFlight(false);
      if (result.isError) {
        if (
          result.error === TwoStepVerificationError.INVALID_USER_ID ||
          result.error === TwoStepVerificationError.INVALID_CHALLENGE_ID
        ) {
          dispatch({
            type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED,
            errorCode: mapTwoStepVerificationErrorToChallengeErrorCode(result.error)
          });
        } else {
          setSendCodeError(mapTwoStepVerificationErrorToResource(resources, result.error));
        }
        return;
      }

      setHasSentSmsCode(true);
    }

    // Automatically re-send the CD2SV prompt when switching to the Cross Device type.
    if (mediaType === MediaType.CrossDevice) {
      setRequestInFlight(true);
      const result = await requestService.twoStepVerification.retryCrossDevice(userId, {
        challengeId,
        actionType
      });
      setRequestInFlight(false);
      if (result.isError) {
        if (
          result.error === TwoStepVerification.TwoStepVerificationError.INVALID_USER_ID ||
          result.error === TwoStepVerification.TwoStepVerificationError.INVALID_CHALLENGE_ID
        ) {
          dispatch({
            type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED,
            errorCode: mapTwoStepVerificationErrorToChallengeErrorCode(result.error)
          });
          return;
        }
        setSendCodeError(mapTwoStepVerificationErrorToResource(resources, result.error));
      }
    }

    history.push(mediaTypeToPath(mediaType));
  };

  /*
   * Rendering Helpers
   */

  const getMediaTypeIcon = (mediaType: MediaType): string => {
    switch (mediaType) {
      case MediaType.Authenticator:
        return 'icon-menu-mobile';
      case MediaType.Email:
        return 'icon-menu-email';
      case MediaType.RecoveryCode:
        return 'icon-menu-recover';
      case MediaType.SMS:
        return 'icon-menu-mobile';
      case MediaType.SecurityKey:
        return 'icon-menu-usb';
      case MediaType.CrossDevice:
        return 'icon-menu-mobile';
      default:
        return 'icon-brokenpage';
    }
  };

  const getMediaTypeLabel = (mediaType: MediaType): string | null => {
    switch (mediaType) {
      case MediaType.Authenticator:
        return resources.Label.AuthenticatorMediaType;
      case MediaType.Email:
        return resources.Label.EmailMediaType;
      case MediaType.RecoveryCode:
        return resources.Label.RecoveryCodeMediaType;
      case MediaType.SMS:
        return resources.Label.SmsMediaType;
      case MediaType.SecurityKey:
        return resources.Label.SecurityKeyMediaType;
      case MediaType.CrossDevice:
        return resources.Label.CrossDeviceMediaType;
      default:
        return null;
    }
  };

  const renderMediaType = (mediaType: MediaType, key: number): JSX.Element | null => {
    const mediaTypeLabel = getMediaTypeLabel(mediaType);
    if (!mediaTypeLabel) {
      return null;
    }

    return (
      <tr
        key={key}
        onClick={requestInFlight ? undefined : () => transitionToMediaType(mediaType)}
        className={requestInFlight ? 'media-type-row disabled' : 'media-type-row'}>
        <td>
          <span className={getMediaTypeIcon(mediaType)} />
        </td>
        <td className='media-type-label'>{mediaTypeLabel}</td>
        <td className='media-type-selector'>
          <span className='icon-next' />
          <div className='icon-placeholder' />
        </td>
      </tr>
    );
  };

  /*
   * Render Properties
   */

  setModalTitleText(resources.Label.TwoStepVerification);
  const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
  const lockIconClassName = renderInline ? 'inline-challenge-lock-icon' : 'modal-lock-icon';
  const marginBottomXLargeClassName = renderInline
    ? 'inline-challenge-margin-bottom-xlarge'
    : 'modal-margin-bottom-xlarge';
  const tableMarginClassName = renderInline ? '' : 'modal-margin-bottom-large';
  const errorTextMarginClassName = renderInline
    ? 'inline-challenge-margin-top-large'
    : 'modal-margin-bottom-large';

  /*
   * Component Markup
   */

  return (
    <BodyElement>
      <div className={lockIconClassName} />
      <p className={marginBottomXLargeClassName}>{resources.Label.ChooseAlternateMediaType}</p>
      <table className={`table table-striped media-type-list ${tableMarginClassName}`}>
        <tbody>
          {enabledMediaTypes.map((mediaType, index) => renderMediaType(mediaType, index))}
        </tbody>
      </table>
      {sendCodeError ? (
        <p className={`text-error xsmall ${errorTextMarginClassName}`}>{sendCodeError}</p>
      ) : null}
      {children}
    </BodyElement>
  );
};

export default MediaTypeList;
