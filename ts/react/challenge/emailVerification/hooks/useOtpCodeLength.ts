import { useEffect, useState } from 'react';
import { getMetadata } from '../../../../common/request/apis/otp';
import * as Otp from '../../../../common/request/types/otp';

// eslint-disable-next-line import/prefer-default-export
export const useOtpCodeLength = (): number => {
  // Default to a sensible value.
  const [otpCodeLength, setOtpCodeLength] = useState<number>(6);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const response = await getMetadata(Otp.Origin.Challenge);
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
