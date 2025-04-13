import React from 'react';
import { TranslationProvider } from 'react-utilities';
import ReminderOfNormsProvider from '../hooks/ReminderOfNormsProvider';
import translationConfig from '../translation.config';
import ReminderOfNormsDialog from '../components/ReminderOfNormsDialog';

function ReminderOfNormsDialogContainer(): JSX.Element {
  return (
    <TranslationProvider config={translationConfig}>
      <ReminderOfNormsProvider>
        <ReminderOfNormsDialog />
      </ReminderOfNormsProvider>
    </TranslationProvider>
  );
}

export default ReminderOfNormsDialogContainer;
