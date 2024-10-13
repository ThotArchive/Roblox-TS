import { useState, useEffect } from 'react';
import { getOtpMetadata } from '../services/otpService';

type UseOtpMetadataReturnType = {
  otpCodeLength: number;
  isOtpEnabled: boolean;
};

function useOtpMetadata(origin: string): UseOtpMetadataReturnType {
  const [otpCodeLength, setOtpCodeLength] = useState<number>(100);
  const [isOtpEnabled, setIsOtpEnabled] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const response = await getOtpMetadata(origin);
        setOtpCodeLength(response.OtpCodeLength);
        setIsOtpEnabled(response.IsOtpEnabled);
      } catch (error) {
        console.warn('otp metadata error');
      }
    };
    // eslint-disable-next-line no-void
    void fetchData();
  }, []);

  return { otpCodeLength, isOtpEnabled };
}

export default useOtpMetadata;
