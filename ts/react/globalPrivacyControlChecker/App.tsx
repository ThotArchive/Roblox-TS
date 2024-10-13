import { useEffect } from 'react';
import userSettingsGlobalPrivacyControlCacheUtils from './utils/userSettingsGlobalPrivacyControlCacheUtils';

// Note: This checker currently does not use any UX components, but a follow up will emit a Toast on successful respecting of GlobalPrivacyControl.
const App = () => {
  useEffect(() => {
    const now = new Date();

    const handleGlobalPrivacyControl = async (): Promise<void> => {
      await userSettingsGlobalPrivacyControlCacheUtils.handleGlobalPrivacyControl(now);
    };

    handleGlobalPrivacyControl().catch(error => {
      console.error(`Error calling shouldIssueGlobalPrivacyControlStatus`);
    });
  }, []);

  return null;
};

export default App;
