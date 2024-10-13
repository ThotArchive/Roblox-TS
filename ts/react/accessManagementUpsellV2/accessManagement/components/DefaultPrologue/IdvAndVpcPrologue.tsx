import React, { useEffect } from 'react';
import { TranslateFunction } from 'react-utilities';
import { IModalService } from 'react-style-guide';
import { useSelector } from 'react-redux';
import useModal from '../../../hooks/useModal';
import { Recourse, UpsellStage } from '../../../enums';
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
  sendAgeChangePageLoadEvent,
  sendEmailParentClickEvent,
  sendVerifyCancelClickEvent,
  sendVerifyIdClickEvent
} from '../../constants/eventConstants';

const IdvAndVpcPrologue = ({
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

  const defaultBodyText = PrologueConstants.Description.IdvAndVpc;
  const connectingBodyText = PrologueConstants.Description.IdvAndVpcConnectingText;

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
  const neutralButtonTranslateKey = PrologueConstants.Action.EmailMyParent;

  const [IdvAndVpcSelectionModal, IdvAndVpcSelectionModalService] = useModal({
    translate,
    title: translatedTitle,
    body: changeAgeBody,
    dualActionButton: true,
    actionButtonTranslateKey,
    neutralButtonTranslateKey,
    onAction: () => {
      sendVerifyIdClickEvent(featureName, false);
      const idvRecourse = recourseResponses.filter(
        response => response.action === Recourse.GovernmentId
      )[0];
      dispatch(setVerificationStageRecourse(idvRecourse));
      dispatch(setStage(UpsellStage.Verification));
      IdvAndVpcSelectionModalService.close();
    },
    size: 'sm',
    onHide: () => {
      sendVerifyCancelClickEvent(featureName, 'IdvOrVpc');
      onHide();
    },
    onNeutral: () => {
      sendEmailParentClickEvent(featureName, false);
      const vpcRecourse = recourseResponses.filter(
        response => response.action !== Recourse.GovernmentId
      )[0];
      dispatch(setVerificationStageRecourse(vpcRecourse));
      dispatch(setStage(UpsellStage.Verification));
      IdvAndVpcSelectionModalService.close();
    }
  });

  // Trigger the opening of the error modal in response to a user action or effect
  useEffect(() => {
    IdvAndVpcSelectionModalService.open();
    sendAgeChangePageLoadEvent(featureName, 'IdvOrVpc');
  }, []);

  return [IdvAndVpcSelectionModal, IdvAndVpcSelectionModalService];
};

export default IdvAndVpcPrologue;
