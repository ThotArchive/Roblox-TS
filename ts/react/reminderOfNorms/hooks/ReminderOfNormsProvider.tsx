import React, { createContext, useContext, useEffect, useState } from 'react';
import { ReminderDataType } from '../utils/types';
import fetchReminderData from '../utils/fetchReminderData';

type ReminderOfNormsContextState = ReminderDataType | null;

export const ReminderOfNormsContext = createContext<ReminderOfNormsContextState>(null);

export const useReminderOfNormsContext = (): ReminderOfNormsContextState =>
  useContext(ReminderOfNormsContext);

const ReminderOfNormsDialog: React.FC = ({ children }) => {
  const [reminderData, setReminderData] = useState<ReminderDataType | null>(null);
  useEffect(() => {
    fetchReminderData().then(
      result => {
        if (result?.data != null) {
          setReminderData(result.data);
        }
      },
      error => {
        console.error(error);
      }
    );
  }, []);
  return (
    <ReminderOfNormsContext.Provider value={reminderData}>
      {children}
    </ReminderOfNormsContext.Provider>
  );
};

export default ReminderOfNormsDialog;
