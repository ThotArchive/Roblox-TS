import React, { useEffect, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { Modal } from 'react-style-guide';
import { useSelector } from 'react-redux';
import {
  resetAccessManagementStore,
  selectCurrentStage,
  selectFeatureAccess,
  selectShowUpsell,
  selectVerificationStageRecourse,
  setRedirectLink,
  setStage,
  fetchFeatureAccess,
  setAmpFeatureCheckData
} from './accessManagementSlice';
import { useAppDispatch } from '../store';
import { ModalEvent, AccessManagementUpsellEventParams } from './constants/viewConstants';
import EmailVerificationContainer from '../recourses/emailVerification/EmailVerificationContainer';
import IDVerificationContainer from '../recourses/IDVerification/IDVerificationContainer';
import { Access, UpsellStage, Recourse } from '../enums';
import Epilogue from './components/Epilogue';
import ParentalRequestContainer from '../recourses/parentalRequest/ParentalRequestContainer';
import Prologue from './components/Prologue';
import LoadingPage from './components/LoadingPage';

function AccessManagementContainer({
  translate
}: {
  translate: TranslateFunction;
}): React.ReactElement {
  let displayContainer;
  const dispatch = useAppDispatch();
  const currentStage = useSelector(selectCurrentStage);
  const featureAccess = useSelector(selectFeatureAccess);
  const showUpsellModal = useSelector(selectShowUpsell);
  const verificationStageRecourse = useSelector(selectVerificationStageRecourse);
  const [onHidecallback, setOnHideCallback] = useState<(access: Access) => string>(
    (access: Access) => access
  );
  const [recourseParameters, setRecourseParameters] = useState<Record<string, string> | null>({});

  const [asyncExit, setAsyncExit] = useState<boolean>(false);

  async function onAccessManagementCustomEvent(
    event: CustomEvent<AccessManagementUpsellEventParams>
  ) {
    const {
      featureName,
      redirectLink,
      ampFeatureCheckData,
      isAsyncCall,
      usePrologue,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ampRecourseData,
      closeCallback
    } = event.detail;
    setOnHideCallback(() => (access: Access): string => closeCallback(access));
    try {
      await dispatch(fetchFeatureAccess({ featureName, ampFeatureCheckData }));
    } catch (error) {
      // Handle error if needed
    }

    dispatch(setRedirectLink(redirectLink));

    setAsyncExit(isAsyncCall);

    if (ampFeatureCheckData) {
      dispatch(setAmpFeatureCheckData(ampFeatureCheckData));
    }
    if (ampRecourseData) {
      setRecourseParameters(ampRecourseData);
    }

    if (usePrologue) {
      dispatch(setStage(UpsellStage.Prologue));
    } else {
      dispatch(setStage(UpsellStage.Verification));
    }
  }

  useEffect(() => {
    const handleEvent = onAccessManagementCustomEvent as EventListener;

    window.addEventListener(ModalEvent.StartAccessManagementUpsell, handleEvent);

    return () => window.removeEventListener(ModalEvent.StartAccessManagementUpsell, handleEvent);
  }, []);

  useEffect(() => {
    const noopAccessState = [Access.Granted, Access.Denied];
    if (featureAccess?.data?.access && noopAccessState.includes(featureAccess.data.access)) {
      onHidecallback(featureAccess.data.access);
    }
  }, [featureAccess]);

  // Loop call FeatureCheck to check new access status
  function onHide() {
    dispatch(resetAccessManagementStore());
    onHidecallback(featureAccess.data.access);
  }

  // Close right away without calling featureCheck again
  function asyncOnHide() {
    dispatch(resetAccessManagementStore());
    onHidecallback(Access.Denied);
  }

  const onHideFunction = asyncExit ? asyncOnHide : onHide;

  function getVerificationContainer() {
    if (verificationStageRecourse) {
      switch (verificationStageRecourse.action) {
        case Recourse.AddedEmail:
          return <EmailVerificationContainer translate={translate} onHide={onHide} />;

        case Recourse.GovernmentId:
          return <IDVerificationContainer translate={translate} onHidecallback={onHideFunction} />;
        case Recourse.ParentConsentRequest:
        case Recourse.ParentLinkRequest: {
          return (
            <ParentalRequestContainer
              recourse={verificationStageRecourse}
              translate={translate}
              onHidecallback={onHideFunction}
              value={recourseParameters}
            />
          );
        }
        // TODO: ADD ERROR PAGE HERE
        default:
          return <Epilogue translate={translate} />;
      }
    }
    return <Epilogue translate={translate} />;
  }

  useEffect(() => {
    displayContainer = getVerificationContainer();
  }, [verificationStageRecourse]);

  switch (currentStage) {
    case UpsellStage.Prologue:
      if (featureAccess.data != null) {
        displayContainer = (
          <Prologue
            translate={translate}
            onHide={onHideFunction}
            recourseParameters={recourseParameters}
          />
        );
      }
      break;
    case UpsellStage.Verification:
      if (featureAccess.data != null) {
        displayContainer = getVerificationContainer();
      }
      break;
    case UpsellStage.Epilogue:
      displayContainer = <Epilogue translate={translate} />;
      break;
    default:
      displayContainer = <LoadingPage />;
      break;
  }

  return (
    <React.Fragment>
      <Modal
        show={showUpsellModal}
        onHide={onHide}
        size='sm'
        aria-labelledby='access-management-modal-title'
        className='access-management-upsell-modal'
        scrollable='true'
        centered='true'>
        {displayContainer}
      </Modal>
    </React.Fragment>
  );
}
export default AccessManagementContainer;
