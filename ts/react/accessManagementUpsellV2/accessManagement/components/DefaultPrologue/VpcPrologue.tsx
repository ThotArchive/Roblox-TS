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
import { sendParentEmailSubmitEvent } from '../../../recourses/parentalRequest/services/eventService';
import {
  EventConstants,
  sendAgeChangePageLoadEvent,
  sendEmailParentClickEvent,
  sendVerifyCancelClickEvent
} from '../../constants/eventConstants';

const VpcPrologue = ({
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

  const defaultBodyText = PrologueConstants.Description.Vpc;
  const connectingBodyText = PrologueConstants.Description.VpcConnectingText;

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

  const defaultTitle = PrologueConstants.Title.AskYourParent;
  const translatedTitle = getPrologueTranslatedTitle(featureName, defaultTitle, translate);

  const actionButtonTranslateKey = PrologueConstants.Action.AskNow;
  const neutralButtonTranslateKey = PrologueConstants.Action.Cancel;

  const [requireVpcModal, requireVpcModalService] = useModal({
    translate,
    title: translatedTitle,
    body: changeAgeBody,
    actionButtonTranslateKey,
    neutralButtonTranslateKey,
    onAction: () => {
      sendEmailParentClickEvent(featureName, true);
      dispatch(setVerificationStageRecourse(recourseResponses[0]));
      dispatch(setStage(UpsellStage.Verification));
      requireVpcModalService.close();
    },
    size: 'sm',
    onHide: () => {
      sendVerifyCancelClickEvent(featureName, 'Vpc');
      onHide();
    },
    onNeutral: () => {
      sendVerifyCancelClickEvent(featureName, 'Vpc');
      onHide();
    }
  });

  // Trigger the opening of the error modal in response to a user action or effect
  useEffect(() => {
    requireVpcModalService.open();
    sendAgeChangePageLoadEvent(featureName, 'Vpc');
  }, []);

  return [requireVpcModal, requireVpcModalService];
};

export default VpcPrologue;
