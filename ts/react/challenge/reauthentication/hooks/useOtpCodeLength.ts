import { useEffect, useState } from 'react';
import { Origin } from '../../../../common/request/types/otp';
import { getMetadata } from '../../../../common/request/apis/otp';

// eslint-disable-next-line import/prefer-default-export
export const useOtpCodeLength = (): number => {
  // Hope that the code length is actually 6 if /v1/metadata dies. Otherwise this component
  // is completely unusable.
  const [otpCodeLength, setOtpCodeLength] = useState<number>(6);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const response = await getMetadata(Origin.Reauth);
      if (!response.isError) {
        setOtpCodeLength(response.value.OtpCodeLength);
      }
    };
    // eslint-disable-next-line no-void
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return otpCodeLength;
};
