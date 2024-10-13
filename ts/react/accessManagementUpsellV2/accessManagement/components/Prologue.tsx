import { TranslateFunction } from 'react-utilities';
import { useEffect } from 'react';
import { IModalService } from 'react-style-guide';
import { useSelector } from 'react-redux';
import { Recourse, UpsellStage } from '../../enums';
import {
  setVerificationStageRecourse,
  setStage,
  selectFeatureAccess
} from '../accessManagementSlice';
import { useAppDispatch } from '../../store';
import VpcPrologue from './DefaultPrologue/VpcPrologue';
import IdvAndVpcPrologue from './DefaultPrologue/IdvAndVpcPrologue';
import IdvPrologue from './DefaultPrologue/IdvPrologue';

const Prologue = ({
  translate,
  onHide
}: {
  translate: TranslateFunction;
  onHide: () => void;
}): JSX.Element => {
  // Trigger the opening of the error modal in response to a user action or effect
  const dispatch = useAppDispatch();
  let [prologueModal, prologueModelService]: [JSX.Element, IModalService] = [null, null];

  const featureAccess = useSelector(selectFeatureAccess);
  const recourseResponses = featureAccess.data.recourses;

  const listOfRecourse: Recourse[] = recourseResponses.map(obj => obj.action);

  if (listOfRecourse.length === 1) {
    switch (listOfRecourse[0]) {
      case Recourse.ParentConsentRequest:
      case Recourse.ParentLinkRequest:
        [prologueModal, prologueModelService] = VpcPrologue({
          translate,
          onHide
        });
        break;
      case Recourse.GovernmentId:
        [prologueModal, prologueModelService] = IdvPrologue({
          translate,
          onHide
        });
        break;
      default:
        break;
    }
  }

  if (listOfRecourse.length === 2) {
    if (listOfRecourse.includes(Recourse.GovernmentId)) {
      if (
        listOfRecourse.includes(Recourse.ParentConsentRequest) ||
        listOfRecourse.includes(Recourse.ParentLinkRequest)
      ) {
        [prologueModal, prologueModelService] = IdvAndVpcPrologue({
          translate,
          onHide
        });
      }
    }
  }

  useEffect(() => {
    if (!prologueModal) {
      // If there is no existing default component, go to verification Upsell
      // directly, default is the first recourse
      dispatch(setStage(UpsellStage.Verification));
    } else {
      prologueModelService.open();
    }
  }, [dispatch, prologueModal, prologueModelService, recourseResponses]);

  return prologueModal;
};

export default Prologue;
