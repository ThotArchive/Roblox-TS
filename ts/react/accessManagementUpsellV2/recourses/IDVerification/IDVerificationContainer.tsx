import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { TranslateFunction } from 'react-utilities';
import Persona from 'persona';
import { DeviceMeta } from 'Roblox';
import LoadingPage from '../../accessManagement/components/LoadingPage';
import {
  fetchIDVerificationStatus,
  selectIDVState,
  selectLoading,
  startIDVerification,
  resetVerificationStore,
  setLoading
} from './verificationSlice';
import { useAppDispatch } from '../../store';
import {
  fetchFeatureAccess,
  selectAmpFeatureCheckData,
  selectFeatureName
} from '../../accessManagement/accessManagementSlice';
import { IDVPage } from '../../enums';
import ChecklistPage from './components/ChecklistPage';
import VendorlinkPage from './components/VendorlinkPage';
import VerificationCompletePage from './components/VerificationCompletePage';

function IDVerification({
  translate,
  onHidecallback,
  ageEstimation
}: {
  translate: TranslateFunction;
  onHidecallback: () => void;
  ageEstimation: boolean;
}): React.ReactElement {
  const POLLING_INTERVAL = 15000; // 15 seconds
  const POLLING_TIMEOUT = 1800000; // 30 minutes
  const endTime = useRef(Number(new Date()) + POLLING_TIMEOUT);

  const dispatch = useAppDispatch();
  const IDVState = useSelector(selectIDVState);
  const loading = useSelector(selectLoading);
  const featureName = useSelector(selectFeatureName);
  const ampFeatureCheckData = useSelector(selectAmpFeatureCheckData);
  const { page } = useSelector(selectIDVState);
  const IDVRecourse = 'GovernmentId';
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
  if (isWebview) {
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
      !loading &&
      vendorVerificationData.verificationLink != null &&
      IDVState.page !== IDVPage.Complete &&
      Number(new Date()) < endTime.current
    ) {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dispatch(fetchIDVerificationStatus(vendorVerificationData.sessionIdentifier));
      }, POLLING_INTERVAL);
    }
  }, [loading]);

  useEffect(() => {
    if (isWebview && page === IDVPage.Complete) {
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
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          dispatch(
            fetchFeatureAccess({
              featureName,
              ampFeatureCheckData,
              successfulAction: IDVRecourse
            })
          );
          onHide();
        },
        onCancel: ({ inquiryId, sessionToken }) => {
          onHide();
        },
        onError: error => {
          console.error(error);
        }
      });
    }
  }, [sessionIdentifier]);

  return <React.Fragment>{isWebview ? IDVComponent : loading && <LoadingPage />}</React.Fragment>;
}

export default IDVerification;
