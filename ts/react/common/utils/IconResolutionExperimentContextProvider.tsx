import React, { createContext, useEffect, useState, useContext } from 'react';
import bedev2Services from '../services/bedev2Services';
import experimentConstants from '../constants/experimentConstants';

const { layerNames, defaultValues } = experimentConstants;

type TIconResolutionExperimentContext = {
  shouldUseHigherResolutionIcon: boolean;
};

const IconResolutionExperimentContext = createContext<TIconResolutionExperimentContext>({
  shouldUseHigherResolutionIcon: false
});

const IconResolutionExperimentContextProvider: React.FC = ({ children }) => {
  const [experimentState, setExperimentState] = useState({
    shouldUseHigherResolutionIcon: false
  });

  useEffect(() => {
    bedev2Services
      .getExperimentationValues(layerNames.tileLayer, defaultValues.tileLayer)
      .then(data => {
        if (data?.IsHigherResolutionImageEnabled) {
          setExperimentState({
            shouldUseHigherResolutionIcon: !!data?.IsHigherResolutionImageEnabled
          });
        }
      })
      .catch(() => {
        // do nothing, as this is non-blocking. we will return false and show control.
      });
  }, []);

  return (
    <IconResolutionExperimentContext.Provider value={experimentState}>
      {children}
    </IconResolutionExperimentContext.Provider>
  );
};

export const useIconResolutionExperiment = (): TIconResolutionExperimentContext => {
  return useContext(IconResolutionExperimentContext);
};

export default IconResolutionExperimentContextProvider;
