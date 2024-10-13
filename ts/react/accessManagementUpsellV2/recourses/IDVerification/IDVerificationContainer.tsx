import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { TranslateFunction } from 'react-utilities';
import {
  selectIDVState,
  startIDVerification,
  fetchIDVerificationStatus,
  resetVerificationStore
} from './verificationSlice';
import {
  fetchFeatureAccess,
  selectAmpFeatureCheckData,
  selectFeatureName
} from '../../accessManagement/accessManagementSlice';
import { IDVPage } from '../../enums';
import { useAppDispatch } from '../../store';
import ChecklistPage from './components/ChecklistPage';
import VendorlinkPage from './components/VendorlinkPage';
import VerificationCompletePage from './components/VerificationCompletePage';

function IDVerification({
  translate,
  onHidecallback
}: {
  translate: TranslateFunction;
  onHidecallback: () => void;
}): React.ReactElement {
  const POLLING_INTERVAL = 15000; // 15 seconds
  const POLLING_TIMEOUT = 1800000; // 30 minutes
  const endTime = useRef(Number(new Date()) + POLLING_TIMEOUT);

  const dispatch = useAppDispatch();
  const IDVState = useSelector(selectIDVState);
  const featureName = useSelector(selectFeatureName);
  const ampFeatureCheckData = useSelector(selectAmpFeatureCheckData);
  const { loading, vendorVerificationData } = IDVState;
  const { page } = useSelector(selectIDVState);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(startIDVerification());
    endTime.current = Number(new Date()) + POLLING_TIMEOUT;
  }, [dispatch]);

  useEffect(() => {
    // Dispatch IDVState is not loading && startIDVerification is successfully called && endScreen is NOT set && does NOT times out
    if (
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
  }, [IDVState.loading]);

  useEffect(() => {
    if (page === IDVPage.Complete) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(fetchFeatureAccess({ featureName, ampFeatureCheckData }));
    }
  }, [page]);

  function onHide() {
    dispatch(resetVerificationStore());
    onHidecallback();
  }

  let IDVComponent = null;
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

  return <React.Fragment>{IDVComponent}</React.Fragment>;
}

export default IDVerification;
