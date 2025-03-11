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
  sendProloguePageLoadEvent,
  sendEmailParentClickEvent,
  sendVerifyCancelClickEvent
} from '../../constants/eventConstants';

const VpcPrologue = ({
  translate,
  onHide,
  recourseParameters
}: {
  translate: TranslateFunction;
  onHide: () => void;
  recourseParameters: Record<string, string> | null;
}): [JSX.Element, IModalService] => {
  const dispatch = useAppDispatch();
  const featureName = useSelector(selectFeatureName);

  const featureAccess = useSelector(selectFeatureAccess);
  const recourseResponses = featureAccess.data.recourses;
  const settingName = recourseParameters ? Object.keys(recourseParameters)[0] : undefined;

  const defaultBodyText = PrologueConstants.Description.Vpc;
  const connectingBodyText = PrologueConstants.Description.VpcConnectingText;

  const translatedBodyText = getPrologueTranslatedBodyText(
    featureName,
    defaultBodyText,
    connectingBodyText,
    translate,
    recourseParameters
  );

  const vpcPrologueBody = (
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
    body: vpcPrologueBody,
    actionButtonTranslateKey,
    neutralButtonTranslateKey,
    onAction: () => {
      sendEmailParentClickEvent(featureName, true, settingName, recourseParameters);
      dispatch(setVerificationStageRecourse(recourseResponses[0]));
      dispatch(setStage(UpsellStage.Verification));
      requireVpcModalService.close();
    },
    size: 'sm',
    onHide: () => {
      sendVerifyCancelClickEvent(featureName, 'Vpc', settingName, recourseParameters);
      onHide();
    },
    onNeutral: () => {
      sendVerifyCancelClickEvent(featureName, 'Vpc', settingName, recourseParameters);
      onHide();
    }
  });

  // Trigger the opening of the error modal in response to a user action or effect
  useEffect(() => {
    requireVpcModalService.open();
    sendProloguePageLoadEvent(featureName, 'Vpc', settingName, recourseParameters);
  }, []);

  return [requireVpcModal, requireVpcModalService];
};

export default VpcPrologue;
