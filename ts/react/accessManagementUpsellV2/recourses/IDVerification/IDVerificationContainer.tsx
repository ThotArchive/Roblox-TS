import Persona from 'persona';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { TranslateFunction } from 'react-utilities';
import { DeviceMeta } from 'Roblox';
import {
  fetchFeatureAccess,
  selectAmpFeatureCheckData,
  selectFeatureName
} from '../../accessManagement/accessManagementSlice';
import LoadingPage from '../../accessManagement/components/LoadingPage';
import { IDVPage } from '../../enums';
import { useAppDispatch } from '../../store';
import ChecklistPage from './components/ChecklistPage';
import VendorlinkPage from './components/VendorlinkPage';
import VerificationCompletePage from './components/VerificationCompletePage';
import {
  fetchIDVerificationStatus,
  resetVerificationStore,
  selectIDVState,
  selectLoading,
  setLoading,
  startIDVerification
} from './verificationSlice';

function IDVerification({
  translate,
  onHidecallback,
  ageEstimation
}: {
  translate: TranslateFunction;
  onHidecallback: () => void;
  ageEstimation: boolean;
}): React.ReactElement {
  const EMBEDDED_FLOW_POLLING_INTERVAL = 5000; // 5 seconds
  const EMBEDDED_FLOW_POLLING_TIMEOUT = 30000; // 30 seconds
  const POLLING_INTERVAL = 10000; // 10 seconds
  const POLLING_TIMEOUT = 1800000; // 30 minutes
  const endTime = useRef(Number(new Date()) + POLLING_TIMEOUT);

  const dispatch = useAppDispatch();
  const IDVState = useSelector(selectIDVState);
  const loading = useSelector(selectLoading);
  const featureName = useSelector(selectFeatureName);
  const ampFeatureCheckData = useSelector(selectAmpFeatureCheckData);
  const { page } = useSelector(selectIDVState);
  const pageRef = useRef(page);
  const embeddedFlowPollingRef = useRef(false);
  const isWebview = (DeviceMeta && DeviceMeta().isInApp) ?? false;

  const { vendorVerificationData } = IDVState;
  const { sessionIdentifier } = vendorVerificationData;

  // methods shared by both webview and non-webview
  useEffect(() => {
    dispatch(setLoading(true));
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(startIDVerification(ageEstimation));
    if (isWebview) {
      endTime.current = Number(new Date()) + POLLING_TIMEOUT;
    }
  }, []);

  function onHide() {
    dispatch(resetVerificationStore());
    onHidecallback();
  }

  // only for webview: use hosted flow
  let IDVComponent = null;
  if (isWebview || page === IDVPage.Complete) {
    switch (page) {
      case IDVPage.VendorLink:
        IDVComponent = <VendorlinkPage translate={translate} onHide={onHide} />;
        break;
      case IDVPage.Checklist:
        IDVComponent = <ChecklistPage translate={translate} onHide={onHide} />;
        break;
      case IDVPage.Complete:
        IDVComponent = <VerificationCompletePage translate={translate} onHide={onHide} />;
        break;
      default:
        IDVComponent = <VendorlinkPage translate={translate} onHide={onHide} />;
        break;
    }
  }

  useEffect(() => {
    // Dispatch IDVState is not loading && startIDVerification is successfully called && endScreen is NOT set && does NOT times out
    if (
      isWebview &&
      !IDVState.loading &&
      vendorVerificationData.verificationLink != null &&
      IDVState.page !== IDVPage.Complete &&
      Number(new Date()) < endTime.current
    ) {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dispatch(fetchIDVerificationStatus(vendorVerificationData.sessionIdentifier));
      }, POLLING_INTERVAL);
    }
  }, [IDVState]);

  useEffect(() => {
    if (page === IDVPage.Complete) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(fetchFeatureAccess({ featureName, ampFeatureCheckData }));
    }
  }, [page]);

  // only for non-webview: use embedded flow
  useEffect(() => {
    if (!isWebview && sessionIdentifier) {
      const personaClient = new Persona.Client({
        inquiryId: sessionIdentifier,
        onReady: () => {
          personaClient.open();
          dispatch(setLoading(false));
        },
        onComplete: ({ inquiryId, status, fields }) => {
          if (embeddedFlowPollingRef.current) return; // prevent multiple polling loops
          dispatch(setLoading(true));
          embeddedFlowPollingRef.current = true;
          const intervalId = setInterval(() => {
            if (pageRef.current !== IDVPage.Complete) {
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              dispatch(fetchIDVerificationStatus(sessionIdentifier));
            }
          }, EMBEDDED_FLOW_POLLING_INTERVAL);
          setTimeout(() => {
            clearInterval(intervalId);
            dispatch(setLoading(false));
          }, EMBEDDED_FLOW_POLLING_TIMEOUT);
        },
        onCancel: ({ inquiryId, sessionToken }) => {
          onHide();
        },
        onError: error => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          dispatch(fetchIDVerificationStatus(vendorVerificationData.sessionIdentifier));
          console.error(error);
        }
      });
    }
  }, [sessionIdentifier]);

  // IDVPage.Complete will be shown for both webview/non-webview to show completion/error state after IDV flow.
  // Loading is only for embedded flow to show loader when embedded flow component is loading as well as transitioning post IDV completion.
  // All other IDVComponent will be only shown for hosted flow since it's explaining which step of IDV the user is on in the hosted flow.
  // TODO: clean up the screens so that completion page is pulled out of the group of other IDV status pages that are only required for hosted flow.
  return (
    <React.Fragment>
      {isWebview || page === IDVPage.Complete ? IDVComponent : loading && <LoadingPage />}
    </React.Fragment>
  );
}

export default IDVerification;
