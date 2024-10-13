import { useContext } from 'react';
import { DeviceIntegrityContext } from '../store/contextProvider';

const useDeviceIntegrityContext: () => DeviceIntegrityContext = () => {
  const context = useContext(DeviceIntegrityContext);
  if (context === null) {
    throw new Error('DeviceIntegrityContext was not provided in the current scope');
  }

  return context;
};

export default useDeviceIntegrityContext;
