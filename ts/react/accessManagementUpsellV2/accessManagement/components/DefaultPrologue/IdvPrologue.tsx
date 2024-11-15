import React, { useEffect } from 'react';
import { TranslateFunction } from 'react-utilities';
import { IModalService } from 'react-style-guide';
import { useSelector } from 'react-redux';
import useModal from '../../../hooks/useModal';
import { UpsellStage } from '../../../enums';
import {
  setVerificationStageRecourse,
  selectFeatureName,
  setStage,
  selectFeatureAccess
} from '../../accessManagementSlice';
import { useAppDispatch } from '../../../store';
import { PrologueConstants } from '../../constants/viewConstants';
import {
  getPrologueTranslatedBodyText,
  getPrologueTranslatedTitle
} from '../../constants/prologueSettings';
import {
  EventConstants,
  sendProloguePageLoadEvent,
  sendVerifyCancelClickEvent,
  sendVerifyIdClickEvent
} from '../../constants/eventConstants';

const IdvPrologue = ({
  translate,
  onHide
}: {
  translate: TranslateFunction;
  onHide: () => void;
}): [JSX.Element, IModalService] => {
  const dispatch = useAppDispatch();
  const featureName = useSelector(selectFeatureName);

  const featureAccess = useSelector(selectFeatureAccess);
  const recourseResponses = featureAccess.data.recourses;

  const defaultBodyText = PrologueConstants.Description.Idv;
  const connectingBodyText = PrologueConstants.Description.IdvConnectingText;

  const translatedBodyText = getPrologueTranslatedBodyText(
    featureName,
    defaultBodyText,
    connectingBodyText,
    translate
  );

  const changeAgeBody = (
    <div>
      <div className='text-description'> {translatedBodyText} </div>
    </div>
  );

  const defaultTitle = PrologueConstants.Title.VerifyYourAge;
  const translatedTitle = getPrologueTranslatedTitle(featureName, defaultTitle, translate);

  const actionButtonTranslateKey = PrologueConstants.Action.VerifyID;
  const neutralButtonTranslateKey = PrologueConstants.Action.Cancel;

  const [requireIdvModal, requireIdvModalService] = useModal({
    translate,
    title: translatedTitle,
    body: changeAgeBody,
    actionButtonTranslateKey,
    neutralButtonTranslateKey,
    onAction: () => {
      sendVerifyIdClickEvent(featureName, true);
      dispatch(setVerificationStageRecourse(recourseResponses[0]));
      dispatch(setStage(UpsellStage.Verification));
      requireIdvModalService.close();
    },
    size: 'sm',
    onHide: () => {
      sendVerifyCancelClickEvent(featureName, 'Idv');
      onHide();
    },
    onNeutral: () => {
      sendVerifyCancelClickEvent(featureName, 'Idv');
      onHide();
    }
  });

  // Trigger the opening of the error modal in response to a user action or effect
  useEffect(() => {
    requireIdvModalService.open();
    sendProloguePageLoadEvent(featureName, 'Idv');
  }, []);

  return [requireIdvModal, requireIdvModalService];
};

export default IdvPrologue;
