import React, { createContext, useContext, useState, FC, useCallback } from 'react';
import { NotificationTemplateProps, NotificationData } from '../types/NotificationTemplateTypes';

export type SelectedNotificationState = {
  displayState: NotificationTemplateProps | null;
  notificationData: NotificationData | null;
};

export const SelectedNotificationContext = createContext<SelectedNotificationState>({
  displayState: null,
  notificationData: null
});

export const useSelectedNotification = (): SelectedNotificationState => {
  return useContext(SelectedNotificationContext);
};

export const useSelectedNotificationProvider = (): {
  SelectedNotificationProvider: FC;
  selectedNotification: SelectedNotificationState;
  setSelectedNotification: (newState: SelectedNotificationState) => void;
} => {
  const [selectedNotification, setSelectedNotification] = useState<SelectedNotificationState>({
    displayState: null,
    notificationData: null
  });

  const providerComponent = useCallback(
    ({ children }) => (
      <SelectedNotificationContext.Provider value={selectedNotification}>
        {children}
      </SelectedNotificationContext.Provider>
    ),
    [selectedNotification]
  );

  return {
    SelectedNotificationProvider: providerComponent,
    selectedNotification,
    setSelectedNotification
  };
};
